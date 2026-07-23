export default function DevCredit({ withCopyright = false }) {
    const PORTFOLIO = 'https://deepakuk17.github.io/portfolio/';
    const linkStyle = {
        color: '#1B5E20',
        fontWeight: 700,
        textDecoration: 'none',
        borderBottom: '1px dashed #1B5E20',
        paddingBottom: '1px',
        transition: 'opacity 0.15s',
    };

    return (
        <p style={{
            textAlign: 'center',
            fontSize: '0.7rem',
            color: '#A0AEC0',
            margin: '8px 0 4px',
            padding: '0 16px',
            lineHeight: 1.8,
        }}>
            {withCopyright && <>© 2026 ABC College · </>}
            Developed by{' '}
            <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer"
                style={linkStyle}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Deepak U K
            </a>
            {' · '}
            <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer"
                style={linkStyle}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                24BTAD013
            </a>
            {' · '}
            <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer"
                style={{ color: '#4A5568', fontSize: '0.68rem', fontStyle: 'italic', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Portfolio ↗
            </a>
        </p>
    );
}
