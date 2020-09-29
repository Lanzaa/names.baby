import React, { useEffect, useState } from 'react';
import names from './namelist';
import Hammer from 'hammerjs';


interface NameResult {
    [name: string]: string; // result can be "good"/"bad"
}

function Swiper() {
  const [undecided, setUndecided] = useState(names);
  const [decided, setDecided] = useState<NameResult[]>([]); //{"nameA": "good", "nameB": "bad"}
  const renderNameRow = (name: string, index: number) => {
    return (
      <tr key={name}>
        <th>{index+1}</th>
        <td>{name}</td>
      </tr>
    );
  };


  const decision = (choice: string) => {
    console.log(decided);
    console.log(undecided);
    const curName = undecided[0];
    if (curName) {
      setDecided([...decided, {[curName]: choice}]);
      setUndecided(undecided.slice(1));
    } else {
      console.log("no names left?");
      alert("Prize time!");
    }
  }

  const swipeLeft = () => {
    console.log("to the left!");
    decision("good");
  }

  const swipeRight = () => {
    console.log("to the right!");
    decision("bad");
  }

  const divRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    var square = divRef.current;
    
    if (!square) {
      console.log("Unable to load reference to swipable area.");
      return; // something failed...
    }
    // Create an instance of Hammer with the reference.
    var hammer = new Hammer(square);
    hammer.on('swipeleft', swipeLeft);
    hammer.on('swiperight', swipeRight);
    return;
  });
  

  console.log('App render');
  return (
    <div className="square" ref={divRef}>
      <table>
        <caption>Names</caption>
        <tbody>
        {undecided.map(renderNameRow)}
        </tbody>
      </table>
    </div>
  );
}

export default Swiper;
