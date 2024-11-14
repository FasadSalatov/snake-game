import Phaser from 'phaser';
import SnakeGameScene from './SnakeGameScene';
import { useEffect } from 'react';

const Game = () => {
  
  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      pixelArt: true,
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [SnakeGameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      }
    };

    // Создаем игру
    const game = new Phaser.Game(config);

    const resizeGame = () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    };

    // Слушатель события resize
    window.addEventListener('resize', resizeGame);

    return () => {
      game.destroy(true);
      window.removeEventListener('resize', resizeGame);
    };
  }, []);

  return <div id="phaser-game"></div>;
};

export default Game;
