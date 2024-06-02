import "./Tile.css";

const Tile = ({ value, onClick, onKeyDown }) => {
  return (
    <div
      className={`tile ${value === 0 ? "empty" : ""}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {value !== 0 ? value : " "}
    </div>
  );
};

export default Tile;
