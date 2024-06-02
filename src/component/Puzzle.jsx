import { useState, useRef, useEffect } from "react";
import "./Puzzle.css";
import Tile from "./Tile";
import { GRID_SIZE } from "../constants/PuzzleConstants";

const Puzzle = () => {
  const helpBtnRef = useRef(null);
  const resetBtnRef = useRef(null);
  const resetTiles = useRef(null);

  const initialArray = [...Array(GRID_SIZE * GRID_SIZE).keys()];
  const FinalArray = Array.from(
    { length: GRID_SIZE * GRID_SIZE - 1 },
    (_, i) => i + 1
  ).concat(0);


  const [tiles, setTiles] = useState();
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isSolvable, setIsSolvable] = useState(true);

  useEffect(() => {
    shuffle();
  }, []);

  useEffect(() => {
    if (!isSolvable) {
      helpBtnRef.current.disabled = true;
      resetBtnRef.current.disabled = true;
    } else {
      helpBtnRef.current.disabled = false;
      resetBtnRef.current.disabled = false;
    }
  }, [isSolvable]);

  useEffect(() => {
    //* function for sliding tiles with keys
    function MoveTileOnKeyPress(e) {
      let blankIndex = tiles?.indexOf(0);
      let row = Math.floor(blankIndex / GRID_SIZE);
      let col = blankIndex % GRID_SIZE;

      switch (e.key) {
        case "ArrowUp":
          if (row < GRID_SIZE - 1) {
            if (!isGameComplete && isSolvable) {
              let newTiles = SwapTiles(
                tiles,
                blankIndex,
                GRID_SIZE + blankIndex
              );
              setTiles(newTiles);
              isPuzzleSolved(newTiles) ? setIsGameComplete(true) : null;
            }
          }
          break;
        case "ArrowDown":
          if (!isGameComplete && isSolvable) {
            if (row > 0) {
              let newTiles = SwapTiles(
                tiles,
                blankIndex,
                blankIndex - GRID_SIZE
              );
              setTiles(newTiles);
              isPuzzleSolved(newTiles) ? setIsGameComplete(true) : null;
            }
          }
          break;
        case "ArrowLeft":
          if (!isGameComplete && isSolvable) {
            if (col < GRID_SIZE - 1) {
              let newTiles = SwapTiles(tiles, blankIndex, blankIndex + 1);
              setTiles(newTiles);
              isPuzzleSolved(newTiles) ? setIsGameComplete(true) : null;
            }
          }
          break;
        case "ArrowRight":
          if (!isGameComplete && isSolvable) {
            if (col > 0) {
              let newTiles = SwapTiles(tiles, blankIndex, blankIndex - 1);
              setTiles(newTiles);
              isPuzzleSolved(newTiles) ? setIsGameComplete(true) : null;
            }
          }
          break;
        default:
        // alert("Use Arrow Keys To Play!");
      }

      //* 37 =>left
      //* 38 =>up
      //* 39 =>right
      //* 40 =>down
    }
    window.addEventListener("keydown", MoveTileOnKeyPress);

    return () => {
      window.removeEventListener("keydown", MoveTileOnKeyPress);
    };
  }, [isPuzzleSolved]);

  //* function for shuffling the puzzle
  function shuffle() {
    let shuffled = initialArray.sort(() => Math.random() - 0.5);
    // let shuffled = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14, 0]; //example
    resetTiles.current = shuffled; // storing shuffled puzzle configuration

    setIsSolvable(true);
    setTiles(shuffled);
    if (!isPuzzleSolvable(shuffled)) {
      setIsSolvable(false);
    }
  }

  //* function for calculating inversions
  function checkInversions(tilesArray) {
    let inversions = 0;
    const filteredTiles = tilesArray.filter((value) => value !== 0);
    // console.log(filteredTiles);
    for (let i = 0; i < filteredTiles.length - 1; i++) {
      for (let j = i + 1; j < filteredTiles.length; j++) {
        if (filteredTiles[i] > filteredTiles[j]) {
          inversions++;
        }
      }
    }
    return inversions;
  }

  //* function for check tiles configuration i.e. solvable or not
  function isPuzzleSolvable(tiles) {
    let inversions = checkInversions(tiles);
    let blankSpace = tiles.indexOf(0);
    let currentRow = GRID_SIZE - Math.floor(blankSpace / GRID_SIZE);

    //* checking solvable conditions
    //* if inversions are even and row is odd
    //* if inversions are odd and row is even

    if (GRID_SIZE % 2 === 0) {
      if (currentRow % 2 === 0) {
        return inversions % 2 !== 0;
      }
      if (currentRow % 2 !== 0) {
        return inversions % 2 === 0;
      }
    } else {
      return inversions % 2 === 0;
    }
  }

  //* function for calculating total no. of misplaced pairs which will help in defining the possible move
  function MisplacedTiles(tiles) {
    let count = 0;
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== FinalArray[i]) {
        count++;
      }
    }
    return count;
  }

  //* function for generating possible moves
  function generatePossibleSteps(tiles) {
    let blankIndex = tiles.indexOf(0);
    let row = Math.floor(blankIndex / GRID_SIZE);
    let col = blankIndex % GRID_SIZE;
    let possibleSteps = [];

    if (row > 0) possibleSteps.push(blankIndex - GRID_SIZE); //up
    if (row < GRID_SIZE - 1) possibleSteps.push(blankIndex + GRID_SIZE); //down
    if (col > 0) possibleSteps.push(blankIndex - 1); //left
    if (col < GRID_SIZE - 1) possibleSteps.push(blankIndex + 1); //right

    return possibleSteps;
  }

  //* function to automate 1 step
  function SolveOneStep() {
    if (isPuzzleSolved(tiles)) {
      setIsGameComplete(true);
      return;
    }

    let blankIndex = tiles.indexOf(0);
    // console.log("blank index inside solve fn", blankIndex);

    let possibleSteps = generatePossibleSteps(tiles);
    // console.log("possible steps inside solve fn=>", possibleSteps);

    let bestPossibleStep = possibleSteps[0];
    // console.log("moves initial=>", bestPossibleStep);

    let misplacedPairs = MisplacedTiles(
      SwapTiles(tiles, blankIndex, bestPossibleStep)
    );
    // console.log("initial misplaced=>", misplacedPairs);

    for (let move of possibleSteps) {
      let newTiles = SwapTiles(tiles, blankIndex, move);
      let shortestMisplacePairs = MisplacedTiles(newTiles);

      if (shortestMisplacePairs < misplacedPairs) {
        misplacedPairs = shortestMisplacePairs;
        bestPossibleStep = move;
      }
    }

    let newTiles = SwapTiles(tiles, blankIndex, bestPossibleStep);
    setTiles(newTiles);
    if (isPuzzleSolved(newTiles)) {
      setIsGameComplete(true);
    }
  }

  //* function for swapping the tiles
  function SwapTiles(tilesArray, blankIndex, tileIndex) {
    let newTiles = tilesArray.slice();
    let indexI = blankIndex;
    let indexJ = tileIndex;
    if (blankIndex > tileIndex) {
      indexI = tileIndex;
      indexJ = blankIndex;
    }
    [newTiles[indexI], newTiles[indexJ]] = [newTiles[indexJ], newTiles[indexI]];

    return newTiles;
  }

  //* function to move tile on mouse click
  function handleTileClick(index) {
    let blankIndex = tiles.indexOf(0);

    //? index-1 =>left
    //? index+1 =>right
    //? index+Size =>Down
    //? index-Size =>Up

    if (
      [index - 1, index + 1, index - GRID_SIZE, index + GRID_SIZE].includes(blankIndex)) {
      let newTile = tiles.slice();
      [newTile[index], newTile[blankIndex]] = [newTile[blankIndex],newTile[index]];
      
      setTiles(newTile);
      if (isPuzzleSolved(newTile)) {
        setIsGameComplete(true);
      }
    }
  }

  //* function for checking whether puzzle is solved or not.
  function isPuzzleSolved(tiles) {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
  }

  //* function to reset the puzzle
  function resetPuzzle() {
    setTiles(resetTiles.current);
  }

  return (
    <div className="container">
      <div className="puzzle-wrapper">
        {isGameComplete && (
          <h1 className="text-center">Congrats Puzzle Has Been Solved!</h1>
        )}
        <div>
          <h1 className="heading text-center">Fifteen Puzzle Game</h1>
          <div tabIndex={0} className={`grid ${!isSolvable ? "active" : ""}`}>
            {tiles &&
              tiles.map((value, i) => (
                <Tile
                  key={i}
                  value={value}
                  onClick={() => handleTileClick(i)}
                />
              ))}
          </div>
        </div>

        <div className="btn-container">
          <button className="btn btn-shuffle" onClick={shuffle}>
            Shuffle Tiles
          </button>
          <button
            ref={helpBtnRef}
            className="btn btn-solve"
            onClick={() => SolveOneStep()}
          >
            Help Me
          </button>
          <button
            ref={resetBtnRef}
            className="btn btn-reset"
            onClick={resetPuzzle}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="instructions-container">
        <h3>
          <strong>Instructions:</strong>
        </h3>
        <ul>
          <li>Use arrow keys or mouse button to change the tiles.</li>
          <li>
            You can reset the puzzle back to the initial position by clicking on
            reset button
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Puzzle;
