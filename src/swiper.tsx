import React, { useEffect, useReducer, useState } from 'react';
import names from './namelist';
import Hammer from 'hammerjs';

import PouchDB from 'pouchdb';

const db = new PouchDB('name-decisions-03');

const NAME_KEY = "name-decision-state";

type dec =
  | "good"
  | "bad";

interface NameDecision {
  name: string,
  decision: dec
  timestamp: number;
}

interface DBData {
  decided?: NameDecision[],
}

interface Data {
  decided: NameDecision[],
  undecided: string[],
  version: number,
}

interface Action {
  type: dec | "reset" | "back";
  payload?: Data
}

function decisionReducer(
  state: Data,
  action: Action
): Data {
  if (action.type === "reset") {
    if (action.payload) {
      return action.payload;
    } else {
      return INITIAL;
    }
  }
  const {undecided, decided, version} = state;
  if (action.type === "back") {
    const lastDecision: NameDecision = decided.slice(-1)[0];
    
    return {
      decided: decided.slice(0,-1),
      undecided: [lastDecision.name, ...undecided],
      version: version - 1,
    }
  }
  //const undecided: string[] = state.undecided;
  if (undecided.length === 0) {
    return state;
  }
  const curName: string = undecided[0];
  //const decided: NameDecision[] = state.decided;
  const decision: dec = action.type;
  const full_decision: NameDecision = {
    name: curName,
    decision,
    timestamp: Date.now(),
  };
  return {
    decided: [...decided, full_decision],
    undecided: undecided.slice(1),
    version: version + 1,
  }
}

function loadDB() {
  return db;
}

function loadStateFromStorage(): Promise<Data> {
  console.log("Need to load state from local storage.");
  const db = loadDB();
  const load_promise = db.get<DBData>(NAME_KEY).then((doc) => {
    const decided: NameDecision[] = doc.decided || [];
    const decided_names: {name: dec} = Object.assign({}, 
      ...decided.map(({name, decision}) => ({[name]: decision })));
    const undecided = names.filter((n) => !(n in decided_names));
    return { decided, undecided, version: 1};
  }).catch((err) => {
    console.log("Error loading from storage", err);
    if (err.status === 404) {
      db.put({_id: NAME_KEY}); // Put first version in
    }
    return {...INITIAL, undecided: names};
  });
  return load_promise;
}
function saveToStorage(state: Data) {
  const db = loadDB();
  const prom = db.get<DBData>(NAME_KEY).then(function(doc) {
    return db.put({
      decided: state.decided,
      _id: NAME_KEY,
      _rev: doc._rev,
    });
  }).then(function(response) {
    console.log("Updated data", response);
  }).catch(function (err) {
    console.log("We f-ed...", err);
  });
  return prom;
}

const divRef = React.createRef<HTMLDivElement>();
const INITIAL: Data = {decided: [], undecided: [], version: 0};
function Swiper(props: any) {
  const [state, dispatch] = useReducer(decisionReducer, INITIAL);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const swipeLeft = () => {
      //console.log("to the left!");
      dispatch({type:"bad"});
    }

    const swipeRight = () => {
      //console.log("to the right!");
      dispatch({type:"good"});
    }

    const swipeDown = () => {
      console.log("OOOO go back!");
      dispatch({type:"back"});
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
    hammer.on('swipedown', swipeDown);
    return;
  }, [dispatch, props.source]);

  useEffect(() => {
    if (isLoading) {
      loadStateFromStorage().then((payload: Data) => {
        dispatch({type:"reset", payload: payload});
        setLoading(false);
      });
    }
  }, [dispatch, isLoading]);
    

  useEffect(() => {
    if (isLoading) {
      return;
    }
    saveToStorage(state);
    return;
  }, [isLoading, state]);

  const goBack = () => {
    dispatch({type: "back"});
    return false;
  };

  const prev_count: number = 5;
  const upcoming_count: number = 5;

  const recent_decisions = state.decided.slice(-1*prev_count);
  const next_name = state.undecided[0];
  const upcoming = state.undecided.slice(1, upcoming_count+1);
  
  return (
    <div className="square" ref={divRef}>
      {!isLoading && (
      <>
        <button onClick={goBack}>Undo</button>
        <p>Remaining: {state.undecided.length}</p>
        <div style={{textAlign: "center"}}>
          <ShowDecisions decided={recent_decisions} />
          <ShowNext next_name={next_name} />
          <ShowUpcoming undecided={upcoming} />
        </div>
      </>
      )}
    </div>
  );
}

function ShowNext({next_name}: {next_name: string}) {
  return (
    <>
    <table>
      <tbody>
        <tr>
          <td>{THUMB_DOWN}</td>
          <th style={{minWidth: '6em'}}><h2>{next_name}</h2></th>
          <td>{THUMB_UP}</td>
        </tr>
      </tbody>
    </table>
    </>
  );
}

function ShowUpcoming(
  {undecided}: {undecided: string[]}
) {
  const renderNameRow = (name: string, index: number) => {
    return (
      <tr key={name}>
        <td>{name}</td>
      </tr>
    );
  };
  return (
    <table>
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
      return '-1';
  }
  ((x: never): never => {throw new Error()}
  )(d)
}

const THUMB_DOWN = '👎';
const THUMB_UP = '👍';

function renderNameDecision(nr: NameDecision) {
  const name: string = nr.name;
  const decision: dec = nr.decision;
  const result: string = thumby(nr.decision);

  const good: boolean = decision === "good";
  const l_r: "left"|"right" = good ? "right" : "left";
  const stylin = {
    textAlign: l_r,
    minWidth: '5em',
  };

  return (
    <tr key={"d"+name}>
      <td>{good || THUMB_DOWN}</td>
      <td style={stylin}>{name}</td>
      <td>{good && THUMB_UP}</td>
    </tr>
  );
}

function ShowDecisions(
  {decided}: {decided: NameDecision[]}
) {
  return (
    <table>
      <tbody>
        {decided.map(renderNameDecision)}
      </tbody>
    </table>
  );
}

export default Swiper;
