import "./Tile.css";

interface Props {
  image?: string;
  number: number;
  highlight: boolean;
  capturable?: boolean;
  inCheck?: boolean;
}

export default function Tile({ number, image, highlight, capturable = false, inCheck = false }: Props) {
  const className: string = ["tile",
    number % 2 === 0 && "black-tile",
    number % 2 !== 0 && "white-tile",
    highlight && "tile-highlight",
    highlight && capturable && "capturable-highlight",
    inCheck && "king-in-check",
    image && "chess-piece-tile"].filter(Boolean).join(' ');

  return (
    <div className={className}>
      {image && <div style={{ backgroundImage: `url(${image})` }} className="chess-piece"></div>}
    </div>
  );
}
