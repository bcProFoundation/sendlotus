import React, { useState } from 'react';
import styled from 'styled-components';
import { SyncOutlined } from '@ant-design/icons';

const StyledIframeCtn = styled.div`
    position: relative;
    width: 100%;
    overflow: hidden;
    margin: auto;
`;

const StyledIframe = styled.iframe`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
`;

const StyledSpinner = styled(SyncOutlined)`
    position: absolute;
    top: 50%;
    left: 50%;
`;

const ResponsiveIframe = ({ src, ratioHeightToWidth }) => {
    const [loading, setLoading] = useState(true);

    const handleIframeOnLoad = () => {
        setLoading(false);
    }

    return (
        <>
            <StyledIframeCtn
                style={{
                    paddingTop: `${ratioHeightToWidth * 100}%`,
                }}
            >
                <StyledSpinner
                    spin
                    style={{ display: loading ? 'block' : 'none' }}
                />
                <StyledIframe
                    style={{ display: loading ? 'none' : 'block' }}
                    loading="lazy"
                    src={src}
                    onLoad={handleIframeOnLoad}
                />
                {/* <div>Embedded QR Code</div> */}
            </StyledIframeCtn>
        </>
    );
};

export default ResponsiveIframe;
