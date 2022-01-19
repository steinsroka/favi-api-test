# favi-api

 Favi의 백엔드 API 서버입니다.

## 초기 설정

처음엔 이 리포지토리를 pull 한 후,
```yarn install``` 커맨드를 이용하여 의존성을 설치합니다. 

(node, npm, yarn 설치가 되어 있다고 가정합니다.)

---

## 개발 서버 설정

이후, ```yarn typeorm schema:sync``` 커맨드를 입력하여 Entity와 DB Table을 동기화 할 수 있습니다.

이 때, ```src/config/develop.config``` 에서 ```default: entities: ``` 줄의 주석을 제거해야 정상적으로 Entity를 인식합니다. 만약 DB 연결 설정을 바꿔야 한다면, 같은 파일에서 설정을 수정할 수 있습니다.

엔티티 폴더는 ```src/common/entity``` 폴더이며, Entity 수정시 해당 폴더를 수정 후 sync 할 수 있습니다.

이후 ``` yarn start:dev ``` 로 개발 모드로 서버를 시작할 수 있습니다.

이 때, ```src/config/develop.config``` 에서 ```default: entities: ``` 줄을 다시 주석 처리합니다. (설정의 문제인 것 같아서 수정이 필요할 것 같은데, 다른 작업을 먼저 하느라 마무리하지 못했습니다 ㅠㅠ)

이 경우, ```http://your-ip:3000/apidocs/```로 접속하면 Swagger API 테스트 문서를 열람할 수 있습니다.

---
## 프로덕션 설정

개발 서버 설정의 내용을 참고하여 DB를 동기화하거나, 직접 DB 스키마를 수정합니다.

``` yarn build ```로 프로젝트를 빌드합니다. 이후

``` yarn start:prod ``` 를 통해 release 모드로 서버를 시작할 수 있습니다.

이 경우, API 테스트 문서는 열람 불가합니다.

---
## TIP


Nest.js의 경우 공식 문서가 굉장히 잘 작성되어 있는 편입니다.

[여기](https://docs.nestjs.kr/) 를 클릭하여 한국어로 된 공식 문서를 열람할 수 있습니다.

개발 도중 처음 보는 클래스 등이 나오는 경우, 공식 문서에서 한번 검색해 보는 것을 추천드립니다.

코드는 src 폴더 내에 정리되어 있습니다.

분류 기준은 controller입니다. (``` yarn start:dev ```) 를 실행하여 나온 API 문서와 함께 열람하시면 구조 파악이 좀 더 용이합니다.

entity는 common 폴더 안에 있습니다. exception filter도 마찬가지입니다.

많은 API가 비인증시 사용 불가로 설정되어 있으므로, 코드 분석을 하실땐 auth 폴더부터 보시는 것을 권장드립니다.

---

## 개발 서버 및 테스트 서버

현재는 AWS를 통하여 개발-테스트-릴리즈 서버를 운영 중압니다.

개발-테스트 서버는 Lightsail VPS 위에서 돌아가고, 릴리즈 서버는 EC2 위에서 작동합니다.

간략하게 설명하면 (실제로는 훨씬 더 복잡함!)

Ligtsail의 경우 다른 Vultur, Conoha, DigitalOcean와 비슷하게 가상 서버를 임대해 주는 서비스입니다.

EC2 또한 비슷하지만, 가격이 조금 더 비싸고 Lightsail에는 없는 여러 기능들이 추가된 가상 서버 임대 서비스라고 생각하면 됩니다.

### 각 서버의 역할은 다음과 같습니다.

* 개발 서버 (arcane_develop_server : Lightsail) : 실질적으로 백엔드 개발자가 다루게 될 서버입니다. 여기서 이 리포지토리를 작성하고 수정하게 됩니다.

* 테스트 서버(arcane_test_server : Lightsail) : 새로운 기능 개발이나 변경 등이 끝난 코드를 올려 프론트엔드 개발자에게 알려주고, 프론트엔드 개발자가 이 서버의 API를 기반으로 작업을 하게 됩니다. 따라서, 개발 서버에서 기능 구현이 끝난 코드들이 실행되게 됩니다. 테스트 서버는 항상 Onlne이어야 합니다!

* 릴리즈 서버(instance ID i-020f8939e5676df51 : EC2) : 테스트 서버에서 테스트와 프론트 기능 개발을 마친 후에 이 서버에 올라가게 됩니다. 이 서버는 실제로 마켓에 업로드된 Favi 어플리케이션의 백엔드 서버입니다!

### DB 설정은 다음과 같습니다.

DBMS 는 Mysql을 사용 중입니다.

* 개발, 테스트 서버에서는 Docker로 Mysql을 올려 사용하고 있습니다. 포트는 기본 포트이며, 만약 재부팅 등으로 도커 컨테이너가 올라오지 않았을 경우 ```docker ps -a``` 를 통해 도커 컨테이너를 확인 후, ```docker start <container id>``` 를 통하여 시작합니다. 만약 직접 DB를 확인하고 싶다면 ```docker exec -it <container id> bash``` 를 통하여 Docker 컨테이너 내부로 진입한 후, mysql 명령어를 사용하면 됩니다. 사용자 이름과 비밀번호 전부 ```root``` 입니다.

* 릴리즈 서버에서는 AWS RDS를 사용 중입니다, RDS의 ```arcanedb``` 입니다.

### Tip : 개발/테스트서버 접속시


VSCODE IDE를 사용하는 경우, Remote 연결 시 VPS의 사양 문제로 연결이 불안정한 경우가 잦습니다.

[Code-Server](https://github.com/coder/code-server) 를 설치해 두었으므로, 웹 기반으로 IDE를 사용하여 코딩할 수 있습니다.

방법은 다음과 같습니다.

1. AWS web console로 접속
2. ~/.config/code-server/config.yaml에서 접속 비밀번호 (password) 확인
3. web console 에서 code-server 를 입력하여 code-server 서버를 활성화
4. 해당 서버의 8080 포트 (예시 : 3.34.17.87:8080)로 들어가 2. 에서 확인한 비밀번호를 입력
5. Web IDE 사용하여 프로그래밍


---

## 하면 좋을 것..

해야 할 것 같은데 못 하고 간 것들..

* 최소한의 테스트, Unit Test까진 안 바라니 Happy Path E2E 테스트라도 만들어야 할 것 같음...
* DB Table 최적화 및 엔티티 설계 고민..
* 배포 과정 고민, nohup 쓰고 있는데 최소한 [PM2](https://pm2.keymetrics.io/) 같은거라도 써야 되지 않을까요?
* User API 수정, Path variable로 user_id 매번 받고 있는데, JWT Token에 이미 user_id가 있으므로 굳이 중복으로 받을 필요가 없음. 그런데 이걸 수정하면 API 호환성이 깨져서, 프론트에서 Request URL을 다 뜯어고쳐야 하니까 일단 냅두긴 했는데... 이후에 버전업 등 한다면 다 빼는게 좋을 것 같음
* build 관련 옵션 설정.. 지금 yarn build 랑 yarn start:dev랑, yarn typeorm schema:sync 등등 여러 설정이 꼬인 것 같은데, 공식 문서 참고해서 권장하는 폴더 구조(기본 폴더 구조) 로 변경하는게 좋아 보임. 위에 빌드할 시 이렇게 저렇게 하세요 하는게 전부 삽질의 결과물입니다..
* DTO 사용해서 프론트에서 필요한 데이터만 보내 주기.. Entity 째로 꺼내서 보내주는 코드가 많은데 이렇게 짜면 안 되긴 하는데....
* AWS 세팅도 EC2하나 쓰는데 로드밸런서 붙어 있고 클플도 쓴다는데 음...... 나중에 누가 손대야 할 것 같읍니다
