export class MessageHandler {
  constructor(bot) {
    this.bot = bot;
    this.handlers = [];
    this.middlewares = [];
    
    this.bot.on('message', (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;
      this.runMiddlewares(msg, () => {
        this.handleMessage(msg);
      });
    });

    this.bot.on('photo', (msg) => {
      this.runMiddlewares(msg, () => {
        this.handleMessage(msg);
      });
    });

    this.bot.on('document', (msg) => {
      this.runMiddlewares(msg, () => {
        this.handleMessage(msg);
      });
    });
    
    this.bot.on('video', (msg) => {
      this.runMiddlewares(msg, () => {
        this.handleMessage(msg);
      });
    });

    this.bot.on('video_note', (msg) => {
      this.runMiddlewares(msg, () => {
        this.handleMessage(msg);
      });
    });
  }

  addHandler(condition, handler) {
    this.handlers.push({ condition, handler });
  }

  addMiddleware(middleware) {
    this.middlewares.push(middleware);
  }

  runMiddlewares(msg, done) {
    let index = 0;
    
    const next = () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        middleware(msg, next);
      } else {
        done();
      }
    };
    
    next();
  }

  handleMessage(msg) {
    for (const { condition, handler } of this.handlers) {
      if (condition(msg)) {
        try {
          handler(msg);
          return;
        } catch (error) {
          console.error('Ошибка в обработчике сообщений:', error);
          this.bot.sendMessage(msg.chat.id, '⚠️ Сообщение об ошибке при обработке',
            {
                protect_content: true
            });
          return;
        }
      }
    }
    
    // Default handler
    if (msg.video_note) {
      this.bot.sendMessage(msg.chat.id, '⚠️ Видео кружочки не принимаются',
            {
                protect_content: true
            });
    }
  }
}