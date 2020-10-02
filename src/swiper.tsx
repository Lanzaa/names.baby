import React, { useEffect, useReducer } from 'react';
import names from './namelist';
import Hammer from 'hammerjs';


type dec =
  | "good"
  | "bad";

interface NameDecision {
  name: string,
  decision: dec
  timestamp?: string;
}

interface NameDecisionsObj {
  [name: string]: dec;
}


interface Data {
  decided: NameDecision[],
  undecided: string[],
  version: number,
}

interface Action {
  type: dec
}

function decisionReducer(state: Data, action: Action): Data {
  const undecided: string[] = state.undecided;
  if (undecided.length === 0) {
    return state;
  }
  const curName: string = undecided[0];
  const decided: NameDecision[] = state.decided;
  const decision: dec = action.type;
  return {
    decided: [...decided, {name: curName, decision: decision}],
    undecided: undecided.slice(1),
    version: state.version + 1,
  }
}
function loadFromStorage(): Data {
  console.log("Need to load from local storage.");
  return {
    undecided: names,
    decided: [],
    version: 1,
  };
}
function saveToStorage(state: Data) {
  console.log("Need to save to local storage.");
  return false;
}

const divRef = React.createRef<HTMLDivElement>();
const initial: Data = loadFromStorage();
function Swiper(props: any) {
  const [state, dispatch] = useReducer(decisionReducer, initial);

  useEffect(() => {
    const swipeLeft = () => {
      //console.log("to the left!");
      dispatch({type:"bad"});
    }

    const swipeRight = () => {
      //console.log("to the right!");
      dispatch({type:"good"});
    }

    console.log('App render');
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
  }, [dispatch, props.source]);

  useEffect(() => {
    console.log("state needs to be saved");
    console.log(state);
    saveToStorage(state);
    return;
  }, [state]);
  
  return (
    <div className="square" ref={divRef}>
      <ShowDecisions decided={state.decided} />
      <ShowUpcoming undecided={state.undecided} />
    </div>
  );
}

function ShowUpcoming(props: any) {
  const renderNameRow = (name: string, index: number) => {
    return (
      <tr key={name}>
        <th>{index+1}</th>
        <td>{name}</td>
      </tr>
    );
  };
  const undecided: string[] = props.undecided;
  //useEffect(() => {
  //  console.log("Upcoming render");
  //  console.log(undecided);
  //});
  return (
    <table>
      <caption>Names</caption>
      <tbody>
      {undecided.map(renderNameRow)}
      </tbody>
    </table>
  );
}

function thumby(d: dec): string {
  switch(d) {
    case "good":
      return '+1';
    case "bad":
      return '-';
  }
  ((x: never): never => {throw new Error()}
  )(d)
}

function Thumb(d: dec) {
  const t: string = thumby(d);
  return (<>{t}</>);
}

function renderNameDecision(nr: NameDecision) {
  const name: string = nr.name;
  const result: string = thumby(nr.decision);
  return (
    <tr key={"d"+name}>
      <td>{name}</td>
      <td>{result}</td>
      <td>{Thumb(nr.decision)}</td>
    </tr>
  );
}

function ShowDecisions(props: any) {
  const decided: NameDecision[] = props.decided;
  //useEffect(() => {
  //  console.log("Decided render");
  //  console.log(decided);
  //});
  return (
    <table>
      <caption>Names decided</caption>
      <tbody>
        {decided.map(renderNameDecision)}
      </tbody>
    </table>
  );
}


export default Swiper;
