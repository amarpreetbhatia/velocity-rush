import TrackSegment from './TrackSegment';

/**
 * StraightSegment class - A straight track segment
 */
class StraightSegment extends TrackSegment {
  constructor(options = {}) {
    super(options);
  }
  
  /**
   * Create the straight track segment
   * This just uses the base implementation from TrackSegment
   */
  createSegment() {
    super.createStraightSegment();
  }
}

export default StraightSegment;
