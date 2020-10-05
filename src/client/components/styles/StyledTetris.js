import styled from 'styled-components';
import bgImage from '../../img/station.jpg';

export const StyledTetrisWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background: url(${bgImage}) #000;
  background-size: cover;
  overflow: hidden;
`;

export const StyledTetris = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 40px;
  margin: 0 auto;
  max-width: 1000px;
  min-width: 900px;
  aside {
    width: 100%;
    max-width: 200px;
    display: block;
    padding: 0 20px;
  }
`;

export const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`

export const StyledPara = styled.p`
  padding: 10px;
  font-family: Pixel, Arial, Helvetica, sans-serif;
  font-size: 1rem;
  color: white;
`;