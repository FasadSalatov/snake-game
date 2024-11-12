import Phaser from 'phaser';

// Tile class for each grid square
class Tile {
  private tile: Phaser.GameObjects.Rectangle;

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    size: number,
    color: number = 0xaaaaaa
  ) {
    this.tile = this.scene.add.rectangle(x, y, size, size, color).setOrigin(0);
  }

  setColor(color: number) {
    this.tile.setFillStyle(color);
  }
}

// GameField class for the grid
class GameField {
  private tiles: Tile[][] = [];
  private rows: number;
  private cols: number;
  private offsetX: number;
  private offsetY: number;

  constructor(
    private scene: Phaser.Scene,
    private tileSize: number,
    width: number,
    height: number
  ) {
    this.rows = Math.floor(height / tileSize);
    this.cols = Math.floor(width / tileSize);

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
    const x = Phaser.Math.Between(0, this.cols - 1) * this.tileSize + this.offsetX;
    const y = Phaser.Math.Between(0, this.rows - 1) * this.tileSize + this.offsetY;
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

  constructor(private scene: Phaser.Scene, private tileSize: number) {
    const startX = this.scene.scale.width / 2;
    const startY = this.scene.scale.height / 2;
    this.body.push(this.scene.add.rectangle(startX, startY, this.tileSize, this.tileSize, 0x00ff00));
  }

  move() {
    const head = this.body[0];
    const newX = head.x + this.direction.x * this.tileSize;
    const newY = head.y + this.direction.y * this.tileSize;

    for (let i = this.body.length - 1; i > 0; i--) {
      this.body[i].setPosition(this.body[i - 1].x, this.body[i - 1].y);
    }

    head.setPosition(newX, newY);
    this.canChangeDirection = true;
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
    return this.body.slice(1).some(part => part.x === head.x && part.y === head.y);
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
  private goldenApple!: GoldenApple | null = null;
  private goldenAppleSpawnChance = 0.1;

  constructor() {
    super({ key: 'SnakeGameScene' });
  }

  create() {
    const minDimension = Math.min(this.scale.width, this.scale.height);
    this.tileSize = Math.floor(minDimension / 30);

    // Centered game field
    this.field = new GameField(this, this.tileSize, this.scale.width, this.scale.height);
    this.snake = new Snake(this, this.tileSize);
    this.apple = new Apple(this, this.field);
    this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, { fontSize: '20px', color: '#fff' });

    // Swipe control
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const swipe = pointer.upX - pointer.downX || pointer.upY - pointer.downY;
      if (Math.abs(swipe) > 30) {
        const isHorizontal = Math.abs(pointer.upX - pointer.downX) > Math.abs(pointer.upY - pointer.downY);
        this.snake.setDirection(isHorizontal ? (pointer.upX > pointer.downX ? 1 : -1) : 0, isHorizontal ? 0 : (pointer.upY > pointer.downY ? 1 : -1));
      }
    });
  }

  update(time: number) {
    if (time - this.lastMoveTime > this.moveInterval) {
      this.lastMoveTime = time;
      this.snake.move();

      const headPos = this.snake.getHeadPosition();
      if (!this.field.isWithinBounds(headPos.x, headPos.y) || this.snake.checkSelfCollision()) {
        this.scene.restart();
        this.score = 0;
        return;
      }

      const applePos = this.apple.getPosition();
      if (headPos.x === applePos.x && headPos.y === applePos.y) {
        this.apple.consume(this.snake);
        this.updateScore();
      }

      if (this.goldenApple && headPos.x === this.goldenApple.getPosition().x && headPos.y === this.goldenApple.getPosition().y) {
        this.goldenApple.consume(this.snake);
        this.updateScore(3);
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
