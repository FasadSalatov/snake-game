import Phaser from 'phaser';

// Tile class for each grid square
class Tile {
  private tile: Phaser.GameObjects.Graphics;

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    size: number,
    color: number = 0xaaaaaa
  ) {
    this.tile = this.scene.add.graphics();
    this.drawRoundedTile(x, y, size - 2, color); // Уменьшаем размер клетки на 2 пикселя
  }

  private drawRoundedTile(x: number, y: number, size: number, color: number) {
    this.tile.clear();
    this.tile.fillStyle(color, 1);
    this.tile.fillRoundedRect(x + 1, y + 1, size, size, size * 0.2); // Сдвиг на 1 пиксель
  }

  setColor(color: number) {
    this.tile.fillStyle(color, 1).fillRoundedRect(this.tile.x, this.tile.y, this.tile.width, this.tile.height, this.tile.width * 0.2);
  }
}

// GameField class for the grid
class GameField {
  private tiles: Tile[][] = [];
  private rows: number = 15; // Fixed number of rows
  private cols: number = 11; // Fixed number of columns
  private offsetX: number;
  private offsetY: number;

  constructor(
    private scene: Phaser.Scene,
    public tileSize: number
  ) {
    // Calculate offset to center the field
    this.offsetX = (this.scene.scale.width - this.cols * tileSize) / 2;
    this.offsetY = (this.scene.scale.height - this.rows * tileSize) / 2;

    this.createField();
  }

  private createField() {
    for (let row = 0; row < this.rows; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < this.cols; col++) {
        const x = this.offsetX + col * this.tileSize;
        const y = this.offsetY + row * this.tileSize;
        this.tiles[row][col] = new Tile(this.scene, x, y, this.tileSize);
      }
    }
  }

  getRandomPosition(): Phaser.Math.Vector2 {
    const col = Phaser.Math.Between(0, this.cols - 1);
    const row = Phaser.Math.Between(0, this.rows - 1);
    const x = this.offsetX + col * this.tileSize + this.tileSize / 2;
    const y = this.offsetY + row * this.tileSize + this.tileSize / 2;
    return new Phaser.Math.Vector2(x, y);
  }

  isWithinBounds(x: number, y: number): boolean {
    return (
      x >= Math.floor(this.offsetX) &&
      x < Math.floor(this.offsetX + this.cols * this.tileSize) &&
      y >= Math.floor(this.offsetY) &&
      y < Math.floor(this.offsetY + this.rows * this.tileSize)
    );
  }
}


// Snake class
class Snake {
  private body: Phaser.GameObjects.Rectangle[] = [];
  private direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private canChangeDirection = true;
  private tweenDuration = 150; // Длительность плавного движения в миллисекундах

  constructor(private scene: Phaser.Scene, private tileSize: number) {
    const startX = this.scene.scale.width / 2;
    const startY = this.scene.scale.height / 2;
    const head = this.scene.add.rectangle(startX, startY, this.tileSize, this.tileSize, 0x00ff00);
    this.body.push(head);

    // Создаем второй сегмент (тело) сразу позади головы
    const bodyPart = this.scene.add.rectangle(startX - this.tileSize, startY, this.tileSize, this.tileSize, 0x00ff00);
    this.body.push(bodyPart);
    const bodyPart2 = this.scene.add.rectangle(startX - this.tileSize, startY, this.tileSize, this.tileSize, 0x00ff00);
    this.body.push(bodyPart2);
  }

  move() {
    const head = this.body[0];
    const newX = head.x + this.direction.x * this.tileSize;
    const newY = head.y + this.direction.y * this.tileSize;
  
    // Проверка самопересечения перед движением головы
    if (this.body.some((part, index) => index !== 0 && part.x === newX && part.y === newY)) {
      this.scene.restart(); // Перезапуск сцены, если обнаружено столкновение
      return;
    }
  
    // Перемещаем части тела змеи по новой позиции головы
    for (let i = this.body.length - 1; i > 0; i--) {
      this.body[i].x = this.body[i - 1].x;
      this.body[i].y = this.body[i - 1].y;
    }
  
    // Перемещаем голову
    head.x = newX;
    head.y = newY;
    this.canChangeDirection = true; // Разрешаем смену направления после завершения движения
  }
  
  
  

  setDirection(x: number, y: number) {
    if (this.canChangeDirection && (x !== -this.direction.x || y !== -this.direction.y)) {
      this.direction.set(x, y);
      this.canChangeDirection = false;
    }
  }

  grow(amount: number = 1) {
    const lastPart = this.body[this.body.length - 1];
    for (let i = 0; i < amount; i++) {
      const newPart = this.scene.add.rectangle(lastPart.x, lastPart.y, this.tileSize, this.tileSize, 0x00ff00);
      this.body.push(newPart);
    }
  }

  checkSelfCollision(): boolean {
    const head = this.body[0];
    const collisionDetected = this.body.slice(1).some(part => part.x === head.x && part.y === head.y);
    
    if (collisionDetected) {
      console.log("Collision detected!");  // Отладочное сообщение
    }
    
    return collisionDetected;
  }

  getHeadPosition() {
    return { x: Math.round(this.body[0].x), y: Math.round(this.body[0].y) };
  }
}

// Apple class and GoldenApple subclass
class Apple {
  protected appleSprite: Phaser.GameObjects.Rectangle;

  constructor(protected scene: Phaser.Scene, private field: GameField, color: number = 0xff0000) {
    this.appleSprite = scene.add.rectangle(0, 0, field.tileSize, field.tileSize, color);
    this.setRandomPosition();
  }

  setRandomPosition() {
    const position = this.field.getRandomPosition();
    this.appleSprite.setPosition(position.x, position.y);
  }

  getPosition() {
    return { x: Math.round(this.appleSprite.x), y: Math.round(this.appleSprite.y) };
  }

  consume(snake: Snake) {
    snake.grow();
    this.setRandomPosition();
  }
}

class GoldenApple extends Apple {
  constructor(scene: Phaser.Scene, field: GameField) {
    super(scene, field, 0xffff00);
  }

  consume(snake: Snake) {
    snake.grow(3);
    this.setRandomPosition();
  }
}

// Main game scene
export default class SnakeGameScene extends Phaser.Scene {
  private snake!: Snake;
  private field!: GameField;
  private tileSize!: number;
  private lastMoveTime = 0;
  private moveInterval = 200;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private apple!: Apple;
  private goldenApple: GoldenApple | null = null;
  private goldenAppleSpawnChance = 0.1;

  constructor() {
    super({ key: 'SnakeGameScene' });
  }

  
  create() {
    const minDimension = Math.min(this.scale.width / 11, this.scale.height / 15);
    this.tileSize = Math.floor(minDimension);

    // Поле, змейка, яблоко
    this.field = new GameField(this, this.tileSize);
    this.snake = new Snake(this, this.tileSize);
    this.apple = new Apple(this, this.field);
    this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, { fontSize: '20px', color: '#fff' });


    // Улучшенная обработка свайпов
this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
  const deltaX = pointer.upX - pointer.downX;
  const deltaY = pointer.upY - pointer.downY;
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  const minSwipeDistance = 50; // Минимальное расстояние свайпа
  const angleTolerance = 0.5; // Допуск на угол (чем выше, тем больше углов можно учитывать)

  // Проверяем, достаточен ли свайп по длине
  if (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance) {
    // Проверка на угол и выбор направления свайпа
    if (absDeltaX > absDeltaY * angleTolerance) {
      // Горизонтальный свайп с допуском по углу
      this.snake.setDirection(deltaX > 0 ? 1 : -1, 0);
    } else if (absDeltaY > absDeltaX * angleTolerance) {
      // Вертикальный свайп с допуском по углу
      this.snake.setDirection(0, deltaY > 0 ? 1 : -1);
    }
  }
});

    // Обработка стрелок с проверкой направления
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          if (this.snake.direction.y === 0) this.snake.setDirection(0, -1);
          break;
        case 'ArrowDown':
          if (this.snake.direction.y === 0) this.snake.setDirection(0, 1);
          break;
        case 'ArrowLeft':
          if (this.snake.direction.x === 0) this.snake.setDirection(-1, 0);
          break;
        case 'ArrowRight':
          if (this.snake.direction.x === 0) this.snake.setDirection(1, 0);
          break;
      }
    });}
  

    update(time: number) {
      if (time - this.lastMoveTime > this.moveInterval) {
        this.lastMoveTime = time;
        this.snake.move();
    
        const headPos = this.snake.getHeadPosition();
        headPos.x = Math.round(headPos.x);
        headPos.y = Math.round(headPos.y);
    
        // Проверка на столкновение с краем поля или с самим собой
        if (!this.field.isWithinBounds(headPos.x, headPos.y) || this.snake.checkSelfCollision()) {
          console.log("Game restarting...");  // Отладочное сообщение
          this.scene.restart(); // Перезапуск сцены при столкновении
          this.score = 0;
          return;
        }
    
        // Остальной код остаётся без изменений
        const applePos = this.apple.getPosition();
        if (Math.abs(headPos.x - applePos.x) < this.tileSize && 
            Math.abs(headPos.y - applePos.y) < this.tileSize) {
          this.apple.consume(this.snake);
          this.updateScore();
        }
    
        if (this.goldenApple) {
          const goldenApplePos = this.goldenApple.getPosition();
          if (Math.abs(headPos.x - goldenApplePos.x) < this.tileSize && 
              Math.abs(headPos.y - goldenApplePos.y) < this.tileSize) {
            this.goldenApple.consume(this.snake);
            this.updateScore(3);
          }
        }
    
        if (!this.goldenApple && Math.random() < this.goldenAppleSpawnChance) {
          this.goldenApple = new GoldenApple(this, this.field);
        }
      }
    }
    

  private updateScore(points = 1) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}
