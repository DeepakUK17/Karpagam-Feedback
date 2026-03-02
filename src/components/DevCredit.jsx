export default function DevCredit({ light = false }) {
    const PORTFOLIO = 'https://deepakuk17.github.io/portfolio/';
    const nameColor = light ? '#7dd3fc' : '#1B5E20';
    const subtleColor = light ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)';
    const urlColor = light ? 'rgba(255,255,255,0.55)' : 'rgba(0,90,60,0.55)';

    const linkStyle = (color) => ({
        color,
        textDecoration: 'none',
        fontWeight: 700,
        borderBottom: `1px dashed ${color}`,
        paddingBottom: '1px',
        cursor: 'pointer',
        transition: 'opacity 0.15s',
    });

    return (
        <div style={{ textAlign: 'center', padding: '10px 16px 6px', lineHeight: 1.9, userSelect: 'none' }}>
            <div style={{ fontSize: '0.78rem', color: subtleColor }}>
                Developed by{' '}
                <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer"
                    style={linkStyle(nameColor)}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    Deepak U K
                </a>
                <span style={{ margin: '0 5px', opacity: 0.5 }}>·</span>
                <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer"
                    style={linkStyle(nameColor)}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    24BTAD013
                </a>
            </div>
            <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.72rem', color: urlColor, textDecoration: 'none', fontStyle: 'italic', borderBottom: `1px solid ${urlColor}`, paddingBottom: '1px' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Portfolio
            </a>
        </div>
    );
}
