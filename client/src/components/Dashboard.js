import React, { useEffect, useState } from "react";
import Axios from "axios";
import Header from "./Header";
import moment from "moment";
import Document from "./Document";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {

  const [documents, setDocuments] = useState([]);
  const [showList, setShowList] = useState([]);
  const [user, setUser] = useState({});
  const [search, setSearch] = useState("");
  const [search2, setSearch2] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    Axios({
      method: "GET",
      url: "/api/users/dashboard",
    })
      .then((res) => {
        setDocuments(res.data.userDocuments);
        setShowList(res.data.userDocuments);
        setUser(res.data.user);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  const handleDelete = (event, Id) => {
    event.stopPropagation();
    const docList = [...documents];
    const newDocList = docList.filter((doc) => doc._id !== Id);
    setDocuments(newDocList);
    setShowList(newDocList);
    Axios({
      method: "POST",
      data: {
        id: Id,
      },
      url: "/api/users/delete",
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  };

  const documentsList = showList.map((doc) => {
    const dateCreated = moment(doc.dateTime).startOf("second").fromNow();
    return (
      <Document
        key={doc._id}
        id={doc._id}
        title={doc.title}
        url={doc.URL}
        creator={doc.creator.username}
        creatorId={doc.creator._id}
        creatorPic={doc.creator.profilePic}
        editAccess={doc.view_edit_access}
        viewAccess={doc.view_access}
        date={dateCreated}
        user={user}
        handleDelete={handleDelete}
      />
    );
  });

  //search tittle
  const searchResult = (event, arr, query) => {
    event.preventDefault();
    let result = arr.filter((el) =>
      el.title.toLowerCase().includes(query.toLowerCase())
    );
    setShowList(result);
  };

  const closeSearch = () => {
    setSearch("");
    setShowList(documents);
  };

  const searchContent = (event, arr, query) => {
    event.preventDefault();
    const result2 = [];
    for (const element of arr) {
      if (element.data === "") {
        continue;
      }
      const ops = element.data.ops;
      if (ops.length > 0) {
        for (const op of ops) {
          if (
            typeof op.insert === "string" &&
            op.insert.toLowerCase().includes(query.toLowerCase())
          ) {
            result2.push(element);
            break;
          }
        }
      }
    }
    setShowList(result2);
  };

  const closeSearch2 = () => {
    setSearch2("");
    setShowList(documents);
  };

  const generateRandomString = () => {
    return Math.random().toString(36).substring(2, 14);
  };

  const newLink = `/documents/${generateRandomString()}`;


  return (
    <div className="flex flex-col">
      <Header
        user={user}
      />
      <section className="bg-[#F8F9FA] pb-10 px-5">
        <div className="w-3/5 mx-auto">
          <div className="flex items-center justify-between py-6">
            <h2 className="text-gray-700 text-lg">Start a new document</h2>
            <button className="button button-icon px-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                />
              </svg>
            </button>
          </div>
          <div>
            <div
              className="relative h-52 w-40 boarder-2 cursor-pointer hover:border-blue-700"
              onClick={() =>
                navigate(newLink, {
                  state: { user: user },
                })
              }
            >
              <img layout="fill" src="https://links.papareact.com/pju" alt="" />
            </div>
            <p className="ml-2 mt-2 font-semibold text-sm text-gray-700">
              Blank
            </p>
          </div>
        </div>
      </section>
      <section className="bg-white px-10 md:px-0 flex flex-col items-center">
        <div className="w-3/5 flex justify-between">
          <form
            className="mt-6 flex items-center px-5 py-2 bg-gray-100 text-gray-600 rounded-lg focus-within:text-gray-600 focus-within:shadow-md"
            onSubmit={(e) => searchResult(e, documents, search)}
            autoComplete="off"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              color="gray"
              size="3xl"
              className="w-6 h-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                color="gray"
                size="3xl"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Title Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-grow px-5 text-base bg-transparent outline-none"
              />
            </svg>
            <input
              type="text"
              placeholder="Title Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-grow px-5 text-base bg-transparent outline-none"
            />
            {search && (
              <button type="button" onClick={closeSearch}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </form>

          <form
            className="mt-6 flex items-center px-5 py-2 bg-gray-100 text-gray-600 rounded-lg focus-within:text-gray-600 focus-within:shadow-md"
            onSubmit={(e) => searchContent(e, documents, search2)}
            autoComplete="off"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              color="gray"
              size="3xl"
              className="w-6 h-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                color="gray"
                size="3xl"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Content Search"
                value={search2}
                onChange={(e) => setSearch2(e.target.value)}
                className="flex-grow px-5 text-base bg-transparent outline-none"
              />
            </svg>
            <input
              type="text"
              placeholder="Content Search"
              value={search2}
              onChange={(e) => setSearch2(e.target.value)}
              className="flex-grow px-5 text-base bg-transparent outline-none"
            />
            {search2 && (
              <button type="button" onClick={closeSearch2}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </form>
        </div>
        <div className="w-3/5 mx-auto py-4 text-sm text-gray-700">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 shadow-md rounded-md">
              <tr>
                <th
                  scope="col"
                  className="py-3 text-xs font-bold text-gray-500 uppercase "
                ></th>
                <th
                  scope="col"
                  className="w-50 py-3 text-xs font-bold text-left text-gray-700 uppercase "
                >
                  My Documents
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-center text-gray-700 uppercase "
                >
                  Creator
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-center text-gray-700 uppercase "
                >
                  Editor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-center text-gray-700 uppercase "
                >
                  Viewer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-center text-gray-700 uppercase "
                >
                  Date Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-center text-gray-700 uppercase "
                >
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{documentsList}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
