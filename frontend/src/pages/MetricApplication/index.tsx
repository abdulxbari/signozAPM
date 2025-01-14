import { Typography } from 'antd';
import Spinner from 'components/Spinner';
import MetricsApplicationContainer from 'container/MetricsApplication';
import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
	GetInitialData,
	GetInitialDataProps,
} from 'store/actions/metrics/getInitialData';
import { ResetInitialData } from 'store/actions/metrics/resetInitialData';
import { AppState } from 'store/reducers';
import AppActions from 'types/actions';
import { GlobalReducer } from 'types/reducer/globalTime';
import MetricReducer from 'types/reducer/metrics';

function MetricsApplication({
	getInitialData,
	resetInitialData,
}: MetricsProps): JSX.Element {
	const { minTime, maxTime } = useSelector<AppState, GlobalReducer>(
		(state) => state.globalTime,
	);
	const { error, errorMessage, metricsApplicationLoading } = useSelector<
		AppState,
		MetricReducer
	>((state) => state.metrics);

	const { servicename } = useParams<ServiceProps>();

	useEffect(() => {
		if (servicename !== undefined) {
			getInitialData({
				serviceName: servicename,
				maxTime,
				minTime,
			});
		}

		return (): void => {
			resetInitialData();
		};
	}, [servicename, getInitialData, resetInitialData, maxTime, minTime]);

	if (metricsApplicationLoading) {
		return <Spinner tip="Loading..." />;
	}

	if (error) {
		return <Typography>{errorMessage}</Typography>;
	}

	return <MetricsApplicationContainer />;
}

interface DispatchProps {
	getInitialData: (props: GetInitialDataProps) => void;
	resetInitialData: () => void;
}

interface ServiceProps {
	servicename?: string;
}

const mapDispatchToProps = (
	dispatch: ThunkDispatch<unknown, unknown, AppActions>,
): DispatchProps => ({
	getInitialData: bindActionCreators(GetInitialData, dispatch),
	resetInitialData: bindActionCreators(ResetInitialData, dispatch),
});

type MetricsProps = DispatchProps;

export default connect(null, mapDispatchToProps)(MetricsApplication);
