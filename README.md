project start!
/////////////////////////////////////////////
1일차. 환경설정 밑작업 feature/4-dbsetting 버전 get started.

1. npm install 로 의존성 모듈 설치.
2. .env 파일을 예시를 통해 생성해서 시크릿 키를 넣는다(salt처럼.)
3. ormconfig.json의 예시를 통해 type, host, port ~ database를 설정한다.
   (예시: "type": "mysql",
   "host": "localhost",
   "port": 3306,
   "username": "root",
   "password": "0000",
   "database": "yangsikdang",)
4. index.ts의 res.send('테스트')가 뜨면 정상작동이다. to be continued...

-01/18 변경사항: ORM스택, sequelize -> TypeORM 변경. 사유: migration ts issue.
/////////////////////////////////////////////
2일차.
