import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { useHistory } from "react-router";
import { Context, ADD_LIST_ITEMS, CLEAR_LIST_ITEMS, SET_LIST_NUMBER, SET_PAGE_NUMBER, SET_FILTER } from './App';
import moment from 'moment';

const Table = () => {
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsloading] = useState(true);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const history = useHistory();
    const context = useContext(Context);
    const { items, listNumber, pageNumber, filter, comments } = context.state

    useEffect(async () => {
        setIsloading(true);
        if (items.length) {
            if (items.length > ((pageNumber * 30) - 29)) {
                setIsloading(false);
                return
            }
        }
        await fetch(`${urls[listNumber]}${pageNumber}.json`)
            .then(res => res.json())
            .then(
                (result) => {
                    context.dispatch({
                        type: ADD_LIST_ITEMS,
                        payload: result,
                    });
                    setHasMore((result.length > 0))
                    setIsloading(false);
                },
                (error) => {
                    setError(error)
                }
            )
    }, [listNumber, pageNumber]);

    const observer = useRef();
    const lastElement = useCallback(node => {
        if (isLoading) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                context.dispatch({
                    type: SET_PAGE_NUMBER,
                    payload: pageNumber + 1 
                })
            }
        })
        if (node) observer.current.observe(node)
    }, [isLoading, hasMore])

    const headers = ['time', 'title', 'domain'];
    const columnsFileds = ['converted_time', 'title', 'domain'];
    const listNames = ['news', 'newest', 'ask', 'show', 'jobs'];
    const urls = ['https://api.hnpwa.com/v0/news/',
                  'https://api.hnpwa.com/v0/newest/',
                  'https://api.hnpwa.com/v0/ask/',
                  'https://api.hnpwa.com/v0/show/',
                  'https://api.hnpwa.com/v0/jobs/']

    const changeList = (index) => {
        context.dispatch({
            type: CLEAR_LIST_ITEMS,
        });
        context.dispatch({
            type: SET_PAGE_NUMBER,
            payload: 1 
        })
        context.dispatch({
            type: SET_FILTER,
            payload: {}
        })
        context.dispatch({
            type: SET_LIST_NUMBER,
            payload: index
        })
    }

    items.forEach(item => {
        let num;
        let duration;

        const date = item.time_ago.split(' ')

        if (isNaN(Number(date[0]))) {
            num = 1;
        } else {
            num = Number(date[0])
        }

        duration = date[1]

        item['converted_time'] = moment().subtract(num, duration).toISOString()
    })

    const setFilter = (column) => {
        const columnName = columnsFileds[column];
        if (filter?.columnName !== columnName) {
            context.dispatch({
                type: SET_FILTER,
                payload: {columnName, dir: 'DSC'}
            })
        } else {
            if (filter.dir === 'ASC') {
                context.dispatch({
                    type: SET_FILTER,
                    payload: {columnName, dir: 'DSC'}
                })
            } else {
                context.dispatch({
                    type: SET_FILTER,
                    payload: {columnName, dir: 'ASC'}
                })
            }
        }
    }

    const setMobileFilter = (direction) => {
        context.dispatch({
            type: SET_FILTER,
            payload: {columnName: 'time_ago', dir: direction}
        })
        setIsMenuOpen(false);
    }

    if (filter.columnName) {
        const columnName = filter.columnName;
        if (filter.dir === 'ASC') {
            items.sort((a, b) => (a[columnName] > b[columnName]) ? 1 : (a[columnName] === undefined ? 0 : -1));
        } else {
            items.sort((a, b) => (a[columnName] < b[columnName]) ? 1 : (a[columnName] === undefined ? 0 : -1));
        }
    }

    return (
        <div className="wrapper">
            <nav className="menu">
                {listNames.map((name, index) => {
                    return (
                        <button className={listNumber === index ? "active list-selector" : "list-selector"}
                            key={index}
                            onClick={() => changeList(index)}>
                            {name}
                        </button>
                    )
                })}
            </nav>
            <h1 className="list-header">{`${listNames[listNumber]} list`}</h1>
            {items.length ?
            <table className="table">
                <thead className="table-headers">
                    <tr className="table-headers-row">
                        {headers.map((header, index) => {
                            return (
                                <th className="table-headers-header" key={index} onClick={() => setFilter(index)}>
                                    <div className="table-headers-header-text" onClick={() => setFilter(index)}>{header}
                                        <span 
                                            className={filter.columnName === columnsFileds[index] ? filter.dir === 'ASC' ? " filter filter-asc" : "filter filter-dsc" : "filter-none"}>
                                        ^
                                        </span>
                                    </div>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {items.map((listItem, index) => {
                        if (items.length === index +1) {
                            return (
                                <tr key={index} className="table-row"  ref={lastElement} onClick={() => history.push(`/comments/?id=${listItem.id}`)}>
                                    <td className="table-row-data table-time"><div>{listItem?.time_ago}</div></td>
                                    <td className="table-row-data table-title"><div>{listItem?.title}</div></td>
                                    <td className="table-row-data table-domain"><div>{listItem?.domain}</div></td>
                                </tr>
                            )
                        } else 
                            return (
                                <tr key={index} className="table-row" onClick={() => history.push(`/comments/?id=${listItem.id}`)}>
                                    <td className="table-row-data table-time"><div>{listItem?.time_ago}</div></td>
                                    <td className="table-row-data table-title"><div>{listItem?.title}</div></td>
                                    <td className="table-row-data table-domain"><div>{listItem?.domain}</div></td>
                                </tr>
                            )
                    })}
                </tbody>
            </table>
            :
            <p>Loading...</p>}
            {isLoading && <div className="information">Loading...</div>}
            {error && <div className="information">{error}</div>}
            {!hasMore && <div className="information">No more data</div>}
            <button className="to-top-button" onClick={() => window.scrollTo({top: 0, left: 0, behavior: 'smooth' })}>To Top</button>
            <button className="to-top-button float-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>sort</button>
            <div className={isMenuOpen ? "float-menu float-menu-open" : "float-menu"}>
                <div className={filter.columnName === "time_ago" && filter.dir === "ASC" ? "float-menu-item float-menu-item-active" : "float-menu-item"}
                    onClick={() => setMobileFilter("ASC")}>
                    Ascending
                </div>
                <div className={filter.columnName === "time_ago" && filter.dir === "DSC" ? "float-menu-item float-menu-item-active" : "float-menu-item"}
                    onClick={() => setMobileFilter("DSC")}>
                    Descending
                </div>
            </div>
        </div>
    )
};

export default Table;