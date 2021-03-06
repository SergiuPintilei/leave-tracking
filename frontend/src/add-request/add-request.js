import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);

import business from 'moment-business';
import { bindable, inject } from 'aurelia-framework';
import { Router} from 'aurelia-router';
import { LeaveService } from '~/services/leave-service';
import { UserService } from '~/services/user-service';
import { HolidayService } from '~/services/holiday-service';
import { LEAVE_TYPES, HUMAN_LEAVE_TYPES } from '~/util/constants';

const { ANNUAL, SICK, PARENTING, UNPAID, STUDY, HALF_DAY } = LEAVE_TYPES;

@inject(LeaveService, UserService, HolidayService, Router)
export class AddRequest {
    @bindable sPick;
    @bindable ePick;

   constructor(_leave, _user, _holiday, router) {
        this._leave = _leave;
        this._user = _user;
        this._holiday = _holiday;
        this.router = router;
    }

    attached() {
        this.disableDates();
    }

    dateFormat = 'YYYY-MM-DD';
    allowedDate = moment().subtract(1, "days").toDate();
    start = moment().toDate();
    end = moment().toDate();

    pickerOptions = {
        calendarWeeks: true,
        showTodayButton: true,
        showClose: true,
        daysOfWeekDisabled: [0, 6], // we disable saturday & sunday
        format: this.dateFormat,
        minDate: this.allowedDate,
        widgetPositioning: {
            horizontal: 'left'
        }
    };

    selectedLeave = {};
    leaveTypes = [
        { value: ANNUAL , option: HUMAN_LEAVE_TYPES[ANNUAL] },
        { value: SICK, option: HUMAN_LEAVE_TYPES[SICK] },
        { value: PARENTING, option: HUMAN_LEAVE_TYPES[PARENTING] },
        { value: STUDY, option: HUMAN_LEAVE_TYPES[STUDY] },
        { value: UNPAID, option: HUMAN_LEAVE_TYPES[UNPAID] },
        { value: HALF_DAY, option: HUMAN_LEAVE_TYPES[HALF_DAY] }
    ];

    sPickChanged() {
        this.sPick.events.onChange = (e) => {
            this.ePick.methods.minDate(e.date);
            this.start = e.date.toDate();
            this.computeDiff();
        }

        this.sPick.events.onHide = (e) => {
            this.ePick.methods.show();
        }
    }

    ePickChanged() {
        const that = this;
        this.ePick.events.onChange = (e) => {
            this.end = e.date.toDate();
            this.computeDiff();
        }
    }

    computeDiff() {
        const fr = moment(this.start);
        const to = moment(this.end);
        const range = moment.range(fr, to);
        let dateDiff = business.weekDays(fr,to) + 1;

        // go over each holiday and see if the range contains any
        // if it does we do not count that holiday :)
        // it is that easy
        this.holidays.forEach(holiday => {
            const hDate = moment(holiday.date).toDate();

            if(range.contains(hDate)) {
                dateDiff--;
            }
        });

        this.dateDiff = dateDiff;
    }

    get canSave() {
        return this.start && this.end && this.dateDiff >= 1;
    }

    submit() {
        if (this.canSave) {
            console.log('adding', this.start, this.end, this.dateDiff)
            const leave = {
                userId: this._user.currentUser.id,
                leaveType: this.selectedLeave[0],
                start: this.start,
                end: this.end,
                workDays: this.dateDiff
            };

            this._leave.addLeaveRequest(leave);

            this.start = moment().toDate();
            this.end = moment().toDate();
            this.dateDiff = 0;

            this.router.navigate('home');
        }
    }

    async disableDates() {
        const holidays = await this._holiday.getHolidays();
        const disabledDates = holidays.map(h => moment(h.date).toDate());

        this.ePick.methods.disabledDates(disabledDates);
        this.sPick.methods.disabledDates(disabledDates);
        this.holidays = holidays;
    }
}
