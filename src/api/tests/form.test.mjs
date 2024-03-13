// test/form.controller.test.mjs
import { expect } from 'chai';
import axios from 'axios';
import sinon from 'sinon';
import { getResponses, demoFormSeed } from '../controllers/form.controller.mjs';
import Response from '../models/response.model.mjs';

describe('Form Controller', () => {
  describe('getResponses', () => {
    it('should return responses with status code 200', async () => {
      const req = {
        query: {
          status: 'in_progress'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub()
      };

      const expectedResponse = {
        responses: [],
        totalResponses: 0,
        pageCount: 0
      };

      sinon.stub(Response, 'countDocuments').resolves(0);
      sinon.stub(Response, 'aggregate').resolves([]);

      await getResponses(req, res);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.send, expectedResponse);

      Response.countDocuments.restore();
      Response.aggregate.restore();
    });
  });

  describe('demoFormSeed', () => {
    it('should seed demo form responses into the database', async () => {
      const mockResponses = [];
      sinon.stub(axios, 'get').resolves({ data: mockResponses });
      sinon.stub(Response, 'deleteMany').resolves();
      sinon.stub(Response, 'insertMany').resolves();

      const result = await demoFormSeed();

      expect(result).to.deep.equal(undefined);

      sinon.assert.calledOnceWithExactly(axios.get, sinon.match.any, sinon.match.any);
      sinon.assert.calledOnce(Response.deleteMany);
      sinon.assert.calledOnce(Response.insertMany);

      axios.get.restore();
      Response.deleteMany.restore();
      Response.insertMany.restore();
    });
  });
});