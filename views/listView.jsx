import React, { useEffect,useState } from 'react';
import styled from 'styled-components';
import DebugComponent from './components/DebugComponent';
import Button from '@atlaskit/button';
import { v4 as uuidv4 } from 'uuid';
import { observeDomChanges } from '../utils';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 100vh;
  margin: 0 auto;
  overflow: auto;
`;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  overflow: auto;
  h2 {
    line-height: 1;
  }
`;

const customContentKey = 'ac:gptdock-confluence:gpt-custom-content-key';

const ListView = () => {

	const [confDiagramResp, setConfDiagramResp] = useState([]);
	const [diagramItemList, setDiagramItemList] = useState([]);
	const [paginationObj, setPaginationObj] = useState({
		hasPrev: false,
		hasNext: true,
		start: 0,
		limit: 25,
		size: 0
	});

	async function loadDiagramListFromConfluence() {
		  const localAp = AP;
			const context = await localAp.context.getContext();
			localAp.request({
        url: "/rest/api/content/",
        type: "GET",
        data: {
          "type": customContentKey,
          "spaceKey": context.confluence.space.key,
          "expand": "version"
        },
        success: function (response) {
          let respJson = JSON.parse(response);
          setPaginationObj({
            hasPrev: respJson._links.prev != undefined,
            hasNext: respJson._links.next != undefined,
            start: respJson.start,
            limit: respJson.limit,
            size: respJson.size
          });
          setConfDiagramResp(respJson.results);
          setTimeout(localAp.resize, 1000);
        },
        error: function (err) {
          console.log("err - ", err)
        }
      });
	}


	async function loadPageData(start, limit) {
		  const localAp = AP;
			const context = await localAp.context.getContext();
			localAp.request({
        url: "/rest/api/content/",
        type: "GET",
        data: {
          "type": customContentKey,
          "spaceKey": context.confluence.space.key,
          "expand": "version",
          "start": start,
          "limit": limit
        },
        success: function (response) {
          let respJson = JSON.parse(response);
          setPaginationObj({
            hasPrev: respJson._links.prev != undefined,
            hasNext: respJson._links.next != undefined,
            start: respJson.start,
            limit: respJson.limit,
            size: respJson.size
          });
          setConfDiagramResp(respJson.results);
          setTimeout(localAp.resize, 1000);
        },
        error: function (err) {
          console.log("err - ", err)
        }
      });
	}



  useEffect(() => {
    loadDiagramListFromConfluence();
    // there is a margin on document.body, perhaps added by Confluence since I didn't found related logic in our code, remove it because it causes a unwanted scrollbar
    observeDomChanges(document.body, () => (document.body.style.margin = '0'));
  }, []);

  useEffect(() => {
    setDiagramItemList(confDiagramResp
      .sort((doc1, doc2) => Number(doc2.id) - Number(doc1.id))
      .map((doc) => {
        return (
          <tr key={doc.id}>
            <td>{doc.title}</td>
          </tr>
        )
      }))
  }, [confDiagramResp]);


  const turnNextPage = (e) => {
      e.preventDefault();
			loadPageData(paginationObj.start + paginationObj.limit, paginationObj.limit);
  };

  const turnPrevPage = (e) => {
      e.preventDefault();
			loadPageData(paginationObj.start - paginationObj.limit, paginationObj.limit);
  };

  return (
    <Page>
      <DebugComponent />
      <Wrapper>
        <h1>Diagramly Collection</h1>
				<table>
          <tbody>
            {diagramItemList}
          </tbody>
        </table>
				<div>
					{ paginationObj.hasPrev &&
						<Button onClick={turnPrevPage}>Prev</Button> 
					}
					{ paginationObj.hasNext &&
						<Button onClick={turnNextPage}>Next</Button> 
					}

				</div>
      </Wrapper>
    </Page>
  );
};

export default ListView;
