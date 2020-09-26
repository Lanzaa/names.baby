import React from 'react';
import names from './namelist';

function Swiper() {
  function renderNameRow(name: string, index: number) {
    return (
      <tr>
        <th>{index+1}</th>
        <td>{name}</td>
      </tr>
    );
  }

  return (
    <table>
      <caption>Names</caption>
      {names.map(renderNameRow)}
    </table>
  );
}

export default Swiper;
