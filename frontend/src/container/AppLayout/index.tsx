import { notification } from 'antd';
import getUserLatestVersion from 'api/user/getLatestVersion';
import getUserVersion from 'api/user/getVersion';
import ROUTES from 'constants/routes';
import TopNav from 'container/Header';
import SideNav from 'container/SideNav';
import history from 'lib/history';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Dispatch } from 'redux';
import { AppState } from 'store/reducers';
import AppActions from 'types/actions';
import {
	UPDATE_CURRENT_ERROR,
	UPDATE_CURRENT_VERSION,
	UPDATE_LATEST_VERSION,
	UPDATE_LATEST_VERSION_ERROR,
} from 'types/actions/app';
import AppReducer from 'types/reducer/app';

import { Content, Layout } from './styles';

function AppLayout(props: AppLayoutProps): JSX.Element {
	const { isLoggedIn } = useSelector<AppState, AppReducer>((state) => state.app);
	const { pathname } = useLocation();
	const { t } = useTranslation();

	const [isSignUpPage, setIsSignUpPage] = useState(ROUTES.SIGN_UP === pathname);

	const [getUserVersionResponse, getUserLatestVersionResponse] = useQueries([
		{
			queryFn: getUserVersion,
			queryKey: 'getUserVersion',
			enabled: isLoggedIn,
		},
		{
			queryFn: getUserLatestVersion,
			queryKey: 'getUserLatestVersion',
			enabled: isLoggedIn,
		},
	]);

	useEffect(() => {
		if (getUserLatestVersionResponse.status === 'idle' && isLoggedIn) {
			getUserLatestVersionResponse.refetch();
		}

		if (getUserVersionResponse.status === 'idle' && isLoggedIn) {
			getUserVersionResponse.refetch();
		}
	}, [getUserLatestVersionResponse, getUserVersionResponse, isLoggedIn]);

	const { children } = props;

	const dispatch = useDispatch<Dispatch<AppActions>>();

	useEffect(() => {
		if (!isLoggedIn) {
			setIsSignUpPage(true);
			history.push(ROUTES.SIGN_UP);
		} else if (isSignUpPage) {
			setIsSignUpPage(false);
		}
	}, [isLoggedIn, isSignUpPage]);

	const latestCurrentCounter = useRef(0);
	const latestVersionCounter = useRef(0);

	useEffect(() => {
		if (isLoggedIn && pathname === ROUTES.SIGN_UP) {
			history.push(ROUTES.APPLICATION);
		}

		if (
			getUserLatestVersionResponse.isFetched &&
			getUserLatestVersionResponse.isError &&
			latestCurrentCounter.current === 0
		) {
			latestCurrentCounter.current = 1;

			dispatch({
				type: UPDATE_LATEST_VERSION_ERROR,
				payload: {
					isError: true,
				},
			});
			notification.error({
				message: t('oops_something_went_wrong_version'),
			});
		}

		if (
			getUserVersionResponse.isFetched &&
			getUserVersionResponse.isError &&
			latestVersionCounter.current === 0
		) {
			latestVersionCounter.current = 1;

			dispatch({
				type: UPDATE_CURRENT_ERROR,
				payload: {
					isError: true,
				},
			});
			notification.error({
				message: t('oops_something_went_wrong_version'),
			});
		}

		if (
			getUserVersionResponse.isFetched &&
			getUserLatestVersionResponse.isSuccess &&
			getUserVersionResponse.data &&
			getUserVersionResponse.data.payload
		) {
			dispatch({
				type: UPDATE_CURRENT_VERSION,
				payload: {
					currentVersion: getUserVersionResponse.data.payload.version,
				},
			});
		}

		if (
			getUserLatestVersionResponse.isFetched &&
			getUserLatestVersionResponse.isSuccess &&
			getUserLatestVersionResponse.data &&
			getUserLatestVersionResponse.data.payload
		) {
			dispatch({
				type: UPDATE_LATEST_VERSION,
				payload: {
					latestVersion: getUserLatestVersionResponse.data.payload.name,
				},
			});
		}
	}, [
		dispatch,
		isLoggedIn,
		pathname,
		t,
		getUserLatestVersionResponse.isLoading,
		getUserLatestVersionResponse.isError,
		getUserLatestVersionResponse.data,
		getUserVersionResponse.isLoading,
		getUserVersionResponse.isError,
		getUserVersionResponse.data,
		getUserLatestVersionResponse.isFetched,
		getUserVersionResponse.isFetched,
		getUserLatestVersionResponse.isSuccess,
	]);

	return (
		<Layout>
			{!isSignUpPage && <SideNav />}
			<Layout>
				<Content>
					{!isSignUpPage && <TopNav />}
					{children}
				</Content>
			</Layout>
		</Layout>
	);
}

interface AppLayoutProps {
	children: ReactNode;
}

export default AppLayout;
