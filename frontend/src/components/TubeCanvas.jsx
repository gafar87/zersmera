import React from "react";

function TubeCanvas({ tubes = [] }) {
  const grouped = tubes.reduce((acc, tube, index) => {
    const row = tube.row || "1";
    if (!acc[row]) acc[row] = [];
    acc[row].push({ ...tube, index });
    return acc;
  }, {});

  const radius = 20;
  const rowGap = 80;

  const maxTubesInRow = Math.max(...Object.values(grouped).map((row) => row.length));
  const svgWidth = 800;
  const circleSpacing = (svgWidth - 2 * radius) / Math.max(1, maxTubesInRow - 1);

  return (
    <div className="overflow-auto border p-4 bg-white rounded shadow">
      <svg
        width="100%"
        height={Object.keys(grouped).length * rowGap + 60}
        viewBox={`0 0 ${svgWidth} ${Object.keys(grouped).length * rowGap + 60}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {Object.entries(grouped)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([row, rowTubes], rowIndex) => (
            <g key={`row-${rowIndex}`} transform={`translate(0, ${rowIndex * rowGap + 50})`}>
              <text x={10} y={-20} fontSize="14" fill="gray">
                Ряд {row}
              </text>
              {rowTubes.map((tube, idx) => {
                const x = radius + idx * circleSpacing;
                const number = tube.number || tube.pipeNumber || tube.index + 1;
                return (
                  <g key={`row-${row}-tube-${tube.index}`}> 
                    <circle
                      cx={x}
                      cy={0}
                      r={radius}
                      fill="#4f46e5"
                      stroke="white"
                      strokeWidth={2}
                    />
                    <text
                      x={x}
                      y={5}
                      fontSize="12"
                      textAnchor="middle"
                      fill="white"
                      style={{ pointerEvents: "none" }}
                    >
                      {number}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
      </svg>
    </div>
  );
}

export default TubeCanvas;