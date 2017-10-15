import _ from 'lodash';
import assert from 'assert';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import cheerio from 'cheerio';

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

global._ = _;
global.should = chai.should();
global.sinon = sinon;
global.cheerio = cheerio;
