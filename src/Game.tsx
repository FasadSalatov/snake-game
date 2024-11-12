import Phaser from 'phaser';
import SnakeGameScene from './SnakeGameScene';
import { useEffect } from 'react';

const Game = () => {
  
  useEffect(() => {
    // Получаем коэффициент DPI
    const scale = window.devicePixelRatio || 1;
    const config: Phaser.Types.Core.GameConfig = {
      pixelArt: true,
      type: Phaser.AUTO,
      width: window.innerWidth * scale,
      height: window.innerHeight * scale,
      scene: [SnakeGameScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
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
