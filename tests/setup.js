import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

// @ts-ignore
global.requestAnimationFrame = cb => setTimeout(cb, 0);
// @ts-ignore
global.cancelAnimationFrame = id => clearTimeout(id);
