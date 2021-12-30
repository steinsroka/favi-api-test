import { ApiProperty } from "@nestjs/swagger";

export class Message {
  constructor(message: string) {
    this.message = message;
  }
  
  @ApiProperty({
    example:"success"
  })
  message: string;
}
