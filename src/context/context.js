import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
   //@@@@@@@@@@@@@@@@@ context vars @@@@@@@@@@@@@@@@@//
   const [githubUser, setGithubUser] = useState(mockUser);
   const [repos, setRepos] = useState(mockRepos);
   const [followers, setFollowers] = useState(mockFollowers);
   // request loading
   const [request, setRequest] = useState(0);
   const [isLoading, setIsLoading] = useState(false);
   // error
   const [error, setError] = useState({ show: false, msg: '' });

   const searchGithubUser = async user => {
      toggleError(); // pa resetear, xsi busco despues de obtener un error
      setIsLoading(true);

      const response = await axios(`${rootUrl}/users/${user}`).catch(err =>
         console.log(err)
      );

      if (response) {
         setGithubUser(response.data);
         const { followers_url, login } = response.data;

         //🔰 para desplegar toda la info de una
         // las respuestas del object q devuelve tiene el orden en q pongo los reqs ( primero la de las repos ), por eso lo puedo destructurar de esta forma. ( devuelve un array con las respuesta en el orden en q se ponen las reqs, en este caso 1ro las repos y 2do los followers , xeso destructuro en el array primero repos y despues followers )
         await Promise.allSettled([
            axios(`${rootUrl}/users/${login}/repos?per_page=100`),
            axios(`${followers_url}?per_page=100`),
         ])
            .then(results => {
               const [repos, followers] = results;
               const status = 'fulfilled';

               if (repos.status === status) {
                  setRepos(repos.value.data);
               }
               if (followers.status === status) {
                  setFollowers(followers.value.data);
               }
            })
            .catch(err => console.log(err));
      } else {
         toggleError(true, 'there is no such user 🤦');
      }

      checkRequest();
      setIsLoading(false);
   };

   // check rate
   const checkRequest = () => {
      axios(`${rootUrl}/rate_limit`)
         .then(({ data }) => {
            let {
               rate: { remaining },
            } = data;

            setRequest(remaining);

            if (remaining === 0) {
               toggleError(true, 'sorry, yor got no more request 👎');
            }
         })
         .catch(err => console.log(err));
   };

   // ⭐ los valores default son pa poder llamarla y resetear todo mas facil
   const toggleError = (show = false, msg = '') => {
      setError({ show, msg });
   };

   // error

   useEffect(checkRequest, []);

   return (
      <GithubContext.Provider
         value={{
            githubUser,
            repos,
            followers,
            request,
            error,
            searchGithubUser,
            isLoading,
         }}
      >
         {children}
      </GithubContext.Provider>
   );
};

export { GithubContext, GithubProvider };

//
//
// ANTES DEL REFACTOR PARA Q CARGUE SOLO CUANDO TENGA TODA LA INFO, Y NO POR PARTES, Q A MI ME PARECIA MAS CHINGON CHINGON
/*
import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
   //@@@@@@@@@@@@@@@@@ context vars @@@@@@@@@@@@@@@@@//
   const [githubUser, setGithubUser] = useState(mockUser);
   const [repos, setRepos] = useState(mockRepos);
   const [followers, setFollowers] = useState(mockFollowers);
   // request loading
   const [request, setRequest] = useState(0);
   const [isLoading, setIsLoading] = useState(false);
   // error
   const [error, setError] = useState({ show: false, msg: '' });

   const searchGithubUser = async user => {
      toggleError();
      setIsLoading(true);

      const response = await axios(`${rootUrl}/users/${user}`).catch(err =>
         console.log(err)
      );

      console.log(response);

      if (response) {
         setGithubUser(response.data);
         const { followers_url, login } = response.data;
         // repos
         axios(`${rootUrl}/users/${login}/repos?per_page=100`).then(response =>
            setRepos(response.data)
         );
         // followers
         axios(`${followers_url}?per_page=100`).then(response =>
            setFollowers(response.data)
         );
      } else {
         toggleError(true, 'there is no such user 🤦');
      }

      checkRequest();
      setIsLoading(false);
   };

   // check rate
   const checkRequest = () => {
      axios(`${rootUrl}/rate_limit`)
         .then(({ data }) => {
            let {
               rate: { remaining },
            } = data;

            setRequest(remaining);

            if (remaining === 0) {
               toggleError(true, 'sorry, yor got no more request 👎');
            }
         })
         .catch(err => console.log(err));
   };

   // los valores default son pa poder llamarla y resetear todo mas facil
   const toggleError = (show = false, msg = '') => {
      setError({ show, msg });
   };

   // error

   useEffect(checkRequest, []);

   return (
      <GithubContext.Provider
         value={{
            githubUser,
            repos,
            followers,
            request,
            error,
            searchGithubUser,
            isLoading,
         }}
      >
         {children}
      </GithubContext.Provider>
   );
};

export { GithubContext, GithubProvider };

//    - [Root Endpoint](https://api.github.com)
//    - [Get User](https://api.github.com/users/wesbos)
//    - [Rate Limit](https://api.github.com/rate_limit)

// - [Repos](https://api.github.com/users/john-smilga/repos?per_page=100)
// - [Followers](https://api.github.com/users/john-smilga/followers)
*/
