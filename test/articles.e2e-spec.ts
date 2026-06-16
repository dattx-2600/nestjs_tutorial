import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { Article } from '../src/articles/entities/article.entity';
import { User } from '../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('ArticlesController (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let tokenUser1: string;
  let tokenUser2: string;
  let mockUser1: User;
  let mockUser2: User;

  beforeAll(async () => {
    // Load AppModule
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Init ValidationPipe
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  // Truncate and seed fake data before each test case
  beforeEach(async () => {
    // Truncate data and forein key
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await dataSource.getRepository(Article).clear();
    await dataSource.getRepository(User).clear();
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash("password_test123", salt);

    mockUser1 = await dataSource.getRepository(User).save({
      name: 'dattx1',
      email: 'dattx1@gmail.com',
      password: hashedPassword,
    });

    mockUser2 = await dataSource.getRepository(User).save({
      name: 'dattx2',
      email: 'dattx2@gmail.com',
      password: hashedPassword,
    });

    // Auto generate token
    tokenUser1 = jwtService.sign({ sub: mockUser1.id, email: mockUser1.email });
    tokenUser2 = jwtService.sign({ sub: mockUser2.id, email: mockUser2.email });
  });

  afterAll(async () => {
    await dataSource.destroy(); // Close connection after test
    await app.close();
  });


  describe('POST /articles', () => {
    it('test create article success', async () => {
      const payload = { title: 'Title test 01', content: 'Content 01' };

      const response = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(payload.title);

      // Check data
      const articleInDb = await dataSource.getRepository(Article).findOne({ where: { id: response.body.id } });
      expect(articleInDb).toBeDefined();
    });

    it('test case lỗi 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/articles')
        .send({ title: 'Test 401', content: 'Abc' })
        .expect(401);
    });
  });

// TEST UPDATE
  describe('PATCH /articles/:id', () => {
    it('test case lỗi 403 Forbidden', async () => {
      // Create new article for test
      const articleOfUser1 = await dataSource.getRepository(Article).save({
        title: 'Bài viết test loi 403',
        content: 'Nội dung test loi 403',
        user: mockUser1,
      });

      // User 2 update articleOfUser1
      await request(app.getHttpServer())
        .patch(`/articles/${articleOfUser1.id}`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({ title: 'title update' })
        .expect(403);
    });

    it('test case update success', async () => {
      // Create new article for test
      const articleOfUser1 = await dataSource.getRepository(Article).save({
        title: 'Bài viết test update success',
        content: 'Nội dung test update success',
        user: mockUser1,
      });

      // User 1 update articleOfUser1
      await request(app.getHttpServer())
        .patch(`/articles/${articleOfUser1.id}`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({ title: 'tiêu đề update success' })
        .expect(200);
    });
  });

  // TEST DELETE
  describe('DELETE /articles/:id', () => {
    it('test case lỗi delete 403 Forbidden', async () => {
      // Create new article for test
      const articleOfUser1 = await dataSource.getRepository(Article).save({
        title: 'Bài viết test loi 403',
        content: 'Nội dung test loi 403',
        user: mockUser1,
      });

      // User 2 delete articleOfUser1
      await request(app.getHttpServer())
        .delete(`/articles/${articleOfUser1.id}`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .expect(403);
    });

    it('test case delete success', async () => {
      // Create new article for test
      const articleOfUser1 = await dataSource.getRepository(Article).save({
        title: 'Bài viết test delete success',
        content: 'Nội dung test delete success',
        user: mockUser1,
      });

      // User 1 delete articleOfUser1
      const response = await request(app.getHttpServer())
        .delete(`/articles/${articleOfUser1.id}`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');

      const articleInDb = await dataSource.getRepository(Article).findOne({ where: { id: articleOfUser1.id } });
      expect(articleInDb).toBeNull();
    });
  });

  // TEST GET
  describe('GET /articles', () => {
    it('test case, page = 1, limit 2', async () => {
      // Fake data test
      await dataSource.getRepository(Article).save([
        { title: 'Bài viết số 1', content: 'Nội dung 1', user: mockUser1 },
        { title: 'Bài viết số 2', content: 'Nội dung 2', user: mockUser1 },
        { title: 'Bài viết số 3', content: 'Nội dung 3', user: mockUser2 },
      ]);

      const response = await request(app.getHttpServer())
        .get('/articles?page=1&limit=2')
        .expect(200);
      // Check paginate data response
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0]).toHaveProperty('title');
      expect(response.body.items[0]).toHaveProperty('user');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta.totalItems).toBe(3);
      expect(response.body.meta.itemCount).toBe(2);
      expect(response.body.meta.itemsPerPage).toBe(2);
      expect(response.body.meta.totalPages).toBe(2);
      expect(response.body.meta.currentPage).toBe(1);
    });

    it('test case default params paginate', async () => {
      await dataSource.getRepository(Article).save({
        title: 'Bài viết 1',
        content: 'Nội dung 1',
        user: mockUser1,
      });

      const response = await request(app.getHttpServer())
        .get('/articles') // no params
        .expect(200);

      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
    });
  });

});