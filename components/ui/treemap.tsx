import * as d3 from "d3";

type TreeNode = {
  type: 'node';
  value: number;
  name: string;
  children: Tree[];
};

type TreeLeaf = {
    type: 'leaf';
    id: string;
    name: string;
    value: number;
    purchase_price: number;
    shares_owned: number;
  };

type Tree = TreeNode | TreeLeaf;

type TreemapProps = {
  data: Tree;
  className?: string;
  onItemClick: (item: { id: string; name: string; value: number; purchase_price: number; shares_owned: number }) => void;
};

export default function Treemap ({ data, className = "", onItemClick }: TreemapProps) {
  const hierarchy = d3.hierarchy(data).sum((d) => d.value);

  const treeGenerator = d3.treemap<Tree>()
    .size([100, 100])
    .padding(1.5);

  const root = treeGenerator(hierarchy);

  const getPercentChange = (leaf: d3.HierarchyRectangularNode<Tree>) => {
    if (leaf.data.type === 'leaf') {
      return ((leaf.data.value - leaf.data.purchase_price) / leaf.data.purchase_price) * 100;
    }
    return 0;
  };

  const colorScale = d3.scalePow<string>()
  .exponent(0.3)
  .domain([-25, 0, 25])
  .range(["#dc2626", "#e2e8f0", "#16a34a"])
  .clamp(true);

  const allShapes = root.leaves().map((leaf, i) => {
    const leafData = leaf.data as TreeLeaf;
    const width = leaf.x1 - leaf.x0;
    const height = leaf.y1 - leaf.y0;
    
    const fontSize = Math.min(width, height) * 0.15;

    return (
      <g 
    key={leafData.id}
    onClick={() => onItemClick({
      id: leafData.id,
      name: leafData.name,
      value: leafData.value,
      purchase_price: leafData.purchase_price,
      shares_owned: leafData.shares_owned
    })}
    className="cursor-pointer"
  >
    <defs>
      <linearGradient id={`gradient-${leafData.id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={colorScale(getPercentChange(leaf))} stopOpacity="1"/>
        <stop offset="100%" stopColor={colorScale(getPercentChange(leaf))} stopOpacity="0.8"/>
      </linearGradient>
    </defs>
    <rect
      x={`${leaf.x0}%`}
      y={`${leaf.y0}%`}
      width={`${width}%`}
      height={`${height}%`}
      stroke="currentColor"
      strokeWidth="0.2"
      fill={`url(#gradient-${leafData.id})`}
      className="opacity-90 hover:opacity-100 transition-opacity duration-200"
    />
    <text
      x={`${leaf.x0 + width/2}%`}
      y={`${leaf.y0 + height/2 - fontSize * 1.2}%`}
      fontSize={`${fontSize * 2.5}%`}
      textAnchor="middle"
      fill="currentColor"
      className="font-bold pointer-events-none"
    >
      {leaf.data.name}
    </text>
    <text
      x={`${leaf.x0 + width/2}%`}
      y={`${leaf.y0 + height/2 + fontSize * 0.8}%`}
      fontSize={`${fontSize * 2}%`}
      textAnchor="middle"
      fill="currentColor"
      className="pointer-events-none"
    >
      ${leaf.data.value.toLocaleString()}
    </text>
  </g>
    );
  });

  return (
    <div className={`w-full h-full ${className}`}>
      <svg 
        viewBox="0 0 100 66" 
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        {allShapes}
      </svg>
    </div>
  );
};