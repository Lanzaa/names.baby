import React from 'react';
import names from './namelist';
import Hammer from 'hammerjs';

class Swiper extends React.Component {
  renderNameRow(name: string, index: number) {
    return (
      <tr key={name}>
        <th>{index+1}</th>
        <td>{name}</td>
      </tr>
    );
  };

  swipeLeft() {
    console.log("to the left!");
  }

  swipeRight() {
    console.log("to the right!");
  }

  alerty() {
    alert("hello world");
  };


  divRef = React.createRef<HTMLDivElement>();
  render() {
    return (
    <div className="square" ref={this.divRef}>
      <table>
        <caption>Names</caption>
        <tbody>
        {names.map(this.renderNameRow)}
        </tbody>
      </table>
      <button onClick={this.alerty}>BUtton here?</button>
    </div>
  );
  }

  componentDidMount() {
    var square = this.divRef.current;
    
    if (!square) {
      console.log("Unable to load reference to swipable area.");
      return false; // something failed...
    }

    console.log("square");
    console.log(square);
    
    // Create an instance of Hammer with the reference.
    var hammer = new Hammer(square);
    
    // Subscribe to a quick start event: press, tap, or doubletap.
    // For a full list of quick start events, read the documentation.
    hammer.on('tap', function(e) {
      e.target.classList.toggle('expand');
      console.log("You're pressing me!");
      alert("You're pressing me!");
      console.log(e);
    });

    hammer.on('swipeleft', this.swipeLeft);
    hammer.on('swiperight', this.swipeRight);
  }
}

export default Swiper;
