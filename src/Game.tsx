import Phaser from 'phaser';
import SnakeGameScene from './SnakeGameScene';
import { useEffect } from 'react';

const Game = () => {
  useEffect(() => {
    // Получаем коэффициент DPI
    const dpi = window.devicePixelRatio || 1;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth * dpi,
      height: window.innerHeight * dpi,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [SnakeGameScene],
      pixelArt: true,  // Сохраняет четкость пикселей
    };

    // Создаем игру
    const game = new Phaser.Game(config);

    // Устанавливаем масштаб для игрового контейнера в зависимости от DPI
    game.canvas.style.width = `${window.innerWidth}px`;
    game.canvas.style.height = `${window.innerHeight}px`;

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="phaser-game"></div>;
};

export default Game;
