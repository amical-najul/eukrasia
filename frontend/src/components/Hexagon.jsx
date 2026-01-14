import React from 'react';

const Hexagon = ({ color, borderColor, icon, label, size = 145, strokeWidth = 12, style = {}, innerStyle = {}, onClick }) => {
    const w = size;
    const h = size * 1.13;

    // Calculate offset to prevent stroke clipping
    // The stroke is centered on the path, so we need padding of at least strokeWidth / 2
    const sw = Number(strokeWidth);
    const pad = Math.max(8, sw / 2 + 2);

    const pts = `${w / 2},${pad} ${w - pad},${h * 0.27} ${w - pad},${h * 0.73} ${w / 2},${h - pad} ${pad},${h * 0.73} ${pad},${h * 0.27}`;

    return (
        <div style={{
            width: `${w}px`,
            height: `${h}px`,
            position: 'relative',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            ...style
        }}
            className="hover:scale-110 active:scale-95"
            onClick={onClick}
        >
            <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
                <polygon
                    points={pts}
                    fill={color}
                    stroke={borderColor || color}
                    strokeWidth={sw}
                    strokeLinejoin="round"
                />
            </svg>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: '#FFFFFF',
                padding: '15px',
                boxSizing: 'border-box',
                zIndex: 1,
                fontFamily: "system-ui, -apple-system, sans-serif",
                ...innerStyle
            }}>
                <div style={{ marginBottom: '8px' }}>{icon}</div>
                {label && (
                    <div style={{ fontSize: '11.22px', fontWeight: 700, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {label}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hexagon;
