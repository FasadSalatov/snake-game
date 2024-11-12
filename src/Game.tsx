import Phaser from 'phaser';
import SnakeGameScene from './SnakeGameScene';
import { useEffect } from 'react';

const Game = () => {
  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [SnakeGameScene],
    };
    const game = new Phaser.Game(config);
    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="phaser-game"></div>;
};

export default Game;
