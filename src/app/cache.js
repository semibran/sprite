
// HACK: cache as stateful module
// this object is loaded in main.js and used in actions.
// the cache can be used to store non-serializable data
// such as images, canvases, timeouts, DOM elements, etc.
// none of the data in the cache should be critical to
// the application, but should be used solely to improve
// performance.
export default {}
