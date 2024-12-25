import * as React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const WalletName = styled.h4`
    font-size: 20px;
    font-weight: bold;
    display: inline-block;
    color: ${props => props.theme.primary};
    margin: 15px;
    @media (max-width: 400px) {
        font-size: 16px;
    }
`;

const WalletLabel = ({ name }) => {
    return (
        <React.Fragment>
            {name && typeof name === 'string' && (
                <WalletName>{name}</WalletName>
            )}
        </React.Fragment>
    );
};

WalletLabel.propTypes = {
    name: PropTypes.string,
};

export default WalletLabel;
