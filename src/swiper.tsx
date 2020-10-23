import React, { useEffect, useReducer } from 'react';
import names from './namelist';
import Hammer from 'hammerjs';

import PouchDB from 'pouchdb';

const db = new PouchDB('name-decisions-03');


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
  saveDecisionToStorage({name: curName, decision: decision});
  return {
    decided: [...decided, {name: curName, decision: decision}],
    undecided: undecided.slice(1),
    version: state.version + 1,
  }
}


function loadDB() {
  return db;
}
function loadFromStorage(): Data {
  console.log("Need to load from local storage.");
  const db = loadDB();
  const xx = db.allDocs({include_docs: true}).then((docs) => {
    console.log("docs");
    console.log(docs);
    const rows = docs.rows;
    console.log("rows");
    console.log(rows);
    //const isDoc = (row: T | undefined)<T>: row is T => row !== undefined;
    const good_rows = rows.flatMap(({doc}) => doc ?? []);
    console.log("good rows");
    console.log(good_rows);
    console.log("Row data");
    const decs: NameDecision[] = good_rows.map(({name, decision}: any): NameDecision => {
      return {name, decision};
    });
    console.log(decs);

    const y = docs.rows.map(({doc: {name, decision}}: any) => {
      return {[name]: decision};
    });
    console.log(y);
  });
  return {
    undecided: names,
    decided: [],
    version: 1,
  };
}
function saveDecisionToStorage(
  {name, decision}: NameDecision
) {
  const db = loadDB();
  db.put({name, decision, "_id": name}).then((uh) => {
    console.log("Saved something...");
    console.log(uh);
  });
};
function saveToStorage(state: Data) {
  console.log("Need to save to local storage.");
  const db = loadDB();
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

  const prev_count: number = 5;
  const upcoming_count: number = 5;

  const recent_decisions = state.decided.slice(-1*prev_count);
  const upcoming = state.undecided.slice(0, upcoming_count);
  
  return (
    <div className="square" ref={divRef}>
      <ShowDecisions decided={recent_decisions} />
      <ShowUpcoming undecided={upcoming} />
      <p>Remaining: {state.undecided.length}</p>
    </div>
  );
}

function ShowUpcoming(
  {undecided}: {undecided: string[]}
) {
  const renderNameRow = (name: string, index: number) => {
    return (
      <tr key={name}>
        <th>{index+1}</th>
        <td>{name}</td>
      </tr>
    );
  };
  //const undecided: string[] = props.undecided;
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

function ShowDecisions(
  {decided}: {decided: NameDecision[]}
) {
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
