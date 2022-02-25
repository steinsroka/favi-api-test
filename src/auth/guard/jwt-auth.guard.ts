import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

/**
 * NestJS의 미들웨어
 * Pipes, Filters, Guards, Interceptors등
 * Pipes: 요청 유효성 검사 및 페이로드 변환. 데이터를 직렬화
 * Filters: 오류처리, 오류처리기를 사용할 경로와 경로의 복잡성 관리
 * Gaurds: 인증 미들웨어, 지정된 경로로 통화할 수 있는 사람과 없는 사람을 서버에 알려줌
 * Interceptors: 응답 매핑 및 캐시 관리와 함께 요청 로깅과 같은 전후미들웨어.
 *               각 요청 전후에 이를 실행하는데 매우 강력함
 *
 * guard -> interceptor(before) -> pipe -> controller -> service
 * -> controller -> interceptor(after) -> filter -> client
 */
