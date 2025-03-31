import "./Tile.css";

interface Props {
  image?: string;
  number: number;
  highlight: boolean;
  capturable?: boolean;
  lastMove?: boolean;
}

export default function Tile({ number, image, highlight, capturable, lastMove }: Props) {
  const className = [
    "tile",
    number % 2 === 0 ? "black-tile" : "white-tile",
    highlight ? "tile-highlight" : "",
    capturable ? "tile-capturable" : "",
    lastMove ? "tile-last-move" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={className}>
      {image && (
        <div
          style={{ backgroundImage: `url(${image})` }}
          className="chess-piece"
        ></div>
      )}
    </div>
  );
}
