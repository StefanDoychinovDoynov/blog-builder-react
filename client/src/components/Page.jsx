import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

const MenuSections = () => {
  const [structure, setStruct] = useState(false)

  useEffect(() => {
    const getStruct = async () => {
      try {
        const schema = await axios.get(`${URL}/structure`);
        setStruct(schema.data);
      } catch(err) {
        console.log("Error:", err);
      }
    }

    getStruct();
  }, [])

  return (
    <>
      {Object.keys(structure).map((dir) => (
        structure[dir].type === 'directory' && structure[dir].contents && (
          <select
            key={dir} 
            onChange={(e) => { window.location.href = e.target.value; }}
          >
            <option value="">{dir.slice(1)}</option>
            {structure[dir].contents.map((page) => (
              <option key={page} value={`/page${dir}/${page}`}>
                {page}
              </option>
            ))}
          </select>
        )
      ))}
    </>
  )
}

function Page() {
  const [pageContent, setPageContent] = useState('Loading...');
  const location = useLocation(); // To get the current path

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        // Extracting the dynamic part of the path after "/page/"
        const pagePath = location.pathname.replace('/page/', '');
        
        const path = pagePath == "/" ? "index" : pagePath;

        // Make a GET request to your backend with the pagePath
        const content = await axios.get(`${URL}/page-get`, {
          params: { pagePath: path }
        });

        // Set the response data (HTML) to state
        setPageContent(content.data);
      } catch (error) {
        console.error('Error fetching page content:', error);
        setPageContent('<p>Failed to load page content.</p>');
      }
    };

    fetchPageContent();
  }, [location]);

  return (
    <div>
      <MenuSections />

      <div dangerouslySetInnerHTML={{ __html: pageContent }} />
    </div>
  );
}

export default Page;