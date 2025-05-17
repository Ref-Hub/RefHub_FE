import React from "react";
import styled from "@emotion/styled";

const Container = styled.div`
  position: fixed; /* 브라우저 창 기준으로 위치 고정 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 자신의 크기만큼 이동하여 중앙 배치 */
  font-size: 1.5rem;
  color: #666;
`;

const MyPage: React.FC = () => {
  return <Container>추후 구현 예정입니다</Container>;
};

export default MyPage;