import randomNumber = require('random-number-csprng');

interface VerifyInfo {
  code: string;

  method: string;

  validTime: Date;
}

class UserVerifyCode {
  private storage: Map<string, VerifyInfo> = new Map();

  async setCode(email: string, method: string): Promise<VerifyInfo> {
    const time = new Date();
    time.setMinutes(time.getMinutes() + 5);
    const verifyInfo: VerifyInfo = {
      code: (await randomNumber(100000, 999999)).toString(),
      method: method,
      validTime: time,
    };
    this.storage.set(email, verifyInfo);
    return verifyInfo;
  }

  verifyCode(email: string, method: string, code: string): boolean {
    if (!this.storage.has(email)) {
      return false;
    }
    const now = new Date();
    const verifyInfo = this.storage.get(email);
    if (
      verifyInfo.validTime > now &&
      verifyInfo.method === method &&
      code === verifyInfo.code
    ) {
      this.storage.delete(email);
      return true;
    }
    return false;
  }
}

export default new UserVerifyCode();
