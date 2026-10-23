import React, { useRef, useState } from 'react';
import { DrawingPath, DrawingPoint } from '../../types';

interface DrawingCanvasProps {
  drawingMode: 'move' | 'draw';
  drawings: DrawingPath[];
  drawColor: string;
  drawWidth: number;
  onAddDrawing: (path: DrawingPath) => void;
  className?: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  drawingMode,
  drawings,
  drawColor,
  drawWidth,
  onAddDrawing,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);
  const isDrawingRef = useRef(false);

  const getNormalizedCoords = (e: React.PointerEvent<SVGSVGElement>): DrawingPoint | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (drawingMode !== 'draw') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;

    const pt = getNormalizedCoords(e);
    if (pt) {
      setCurrentPoints([pt]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingRef.current || drawingMode !== 'draw') return;
    e.preventDefault();

    const pt = getNormalizedCoords(e);
    if (pt) {
      setCurrentPoints((prev) => {
        // avoid storing points too close to reduce noise
        const last = prev[prev.length - 1];
        if (last) {
          const distSq = (last.x - pt.x) ** 2 + (last.y - pt.y) ** 2;
          if (distSq < 0.2) return prev;
        }
        return [...prev, pt];
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingRef.current || drawingMode !== 'draw') return;
    e.preventDefault();
    isDrawingRef.current = false;

    if (currentPoints.length >= 2) {
      const newPath: DrawingPath = {
        id: `draw-${Date.now()}`,
        points: currentPoints,
        color: drawColor,
        width: drawWidth,
        isArrow: true,
        type: 'arrow',
      };
      onAddDrawing(newPath);
    }
    setCurrentPoints([]);
  };

  const pointsToSvgPath = (points: DrawingPoint[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, index) => {
      return index === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  };

  // Helper to compute arrowhead coordinates
  const renderArrowHead = (points: DrawingPoint[], color: string, width: number) => {
    if (points.length < 2) return null;
    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];

    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const arrowLen = 2.2 + width * 0.2;
    const arrowAngle = Math.PI / 6; // 30 degrees

    const xA = p2.x - arrowLen * Math.cos(angle - arrowAngle);
    const yA = p2.y - arrowLen * Math.sin(angle - arrowAngle);
    const xB = p2.x - arrowLen * Math.cos(angle + arrowAngle);
    const yB = p2.y - arrowLen * Math.sin(angle + arrowAngle);

    return (
      <polygon
        points={`${p2.x},${p2.y} ${xA},${yA} ${xB},${yB}`}
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
    );
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute inset-0 w-full h-full touch-none-board z-25 ${
        drawingMode === 'draw' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
      } ${className}`}
    >
      <defs>
        <filter id="drawGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Persisted Drawings */}
      {drawings.map((path) => (
        <g key={path.id} filter="url(#drawGlow)">
          <path
            d={pointsToSvgPath(path.points)}
            fill="none"
            stroke={path.color}
            strokeWidth={path.width * 0.35}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {path.isArrow && renderArrowHead(path.points, path.color, path.width)}
        </g>
      ))}

      {/* Actively Drawing Path */}
      {currentPoints.length >= 2 && (
        <g filter="url(#drawGlow)">
          <path
            d={pointsToSvgPath(currentPoints)}
            fill="none"
            stroke={drawColor}
            strokeWidth={drawWidth * 0.35}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1,1"
          />
          {renderArrowHead(currentPoints, drawColor, drawWidth)}
        </g>
      )}
    </svg>
  );
};
