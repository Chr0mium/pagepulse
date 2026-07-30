export class Semaphore {
    constructor(limit) {
      this.limit = limit;
      this.active = 0;
      this.queue = [];
    }
  
    async acquire() {
      if (this.active < this.limit) {
        this.active++;
        return;
      }
  
      await new Promise((resolve) => {
        this.queue.push(resolve);
      });
  
      this.active++;
    }
  
    release() {
      this.active--;
  
      const next = this.queue.shift();
  
      if (next) {
        next();
      }
    }
  }