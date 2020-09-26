import React from 'react';

function Notes() {
  const todos = {
    "Create todo list": {"checked": true},
    "Do react tutorial": {},
    "Make basic page outlines": {}
  };

  function renderTodoRow(item: Array<any>, index: number) {
    const name = item[0]
    const data = item[1]
    return (
      <tr>
        <th>{index+1}</th>
        <td>{name}</td>
        <td>{(data.checked && "☑") || "☐"}</td>
      </tr>
    );
  }

  return (
    <table>
      <caption>TODO items</caption>
      {Object.entries(todos).map(renderTodoRow)}
    </table>
  );
}

export default Notes;
