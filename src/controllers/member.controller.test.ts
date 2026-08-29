import { Response } from 'express';
import memberController from './member.controller';
import MemberService from '../models/Member.service';
import AuthService from '../models/Auth.service';
import { MemberType } from '../libs/enums/member.enum';
import { ExtendedRequest } from '../libs/types/member';

jest.mock('../models/Member.service');
jest.mock('../models/Auth.service');

const mockedMemberServiceInstance = (MemberService as jest.Mock).mock.instances[0];
const mockedAuthServiceInstance = (AuthService as jest.Mock).mock.instances[0];

const buildRes = (): Response => {
	const res: Partial<Response> = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
		cookie: jest.fn().mockReturnThis(),
	};
	return res as Response;
};

describe('memberController.signup', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('ignores a client-supplied memberType and always creates the member as MemberType.USER', async () => {
		(mockedMemberServiceInstance.signup as jest.Mock).mockResolvedValue({
			_id: 'member1',
			memberNick: 'nick',
			memberType: MemberType.USER,
		});
		(mockedAuthServiceInstance.createToken as jest.Mock).mockResolvedValue('token123');

		const req = {
			body: {
				memberNick: 'nick',
				memberPhone: '01012345678',
				memberPassword: 'pw123',
				memberType: MemberType.SELLER, // attempted privilege escalation
			},
		} as unknown as ExtendedRequest;
		const res = buildRes();

		await memberController.signup(req, res);

		expect(mockedMemberServiceInstance.signup).toHaveBeenCalledWith(
			expect.objectContaining({ memberType: MemberType.USER }),
		);
		expect(mockedMemberServiceInstance.signup).not.toHaveBeenCalledWith(
			expect.objectContaining({ memberType: MemberType.SELLER }),
		);
	});
});

describe('memberController.updateMember', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('ignores client-supplied memberType/memberStatus/memberPoints and only forwards whitelisted fields', async () => {
		(mockedMemberServiceInstance.updateMember as jest.Mock).mockResolvedValue({
			_id: 'member1',
			memberNick: 'newNick',
		});

		const req = {
			member: { _id: 'member1' },
			body: {
				memberNick: 'newNick',
				memberType: 'SELLER',
				memberStatus: 'ACTIVE',
				memberPoints: 999999,
				memberPassword: 'hacked',
			},
		} as unknown as ExtendedRequest;
		const res = buildRes();

		await memberController.updateMember(req, res);

		expect(mockedMemberServiceInstance.updateMember).toHaveBeenCalledTimes(1);
		const [, updateInput] = (mockedMemberServiceInstance.updateMember as jest.Mock).mock.calls[0];

		expect(updateInput).not.toHaveProperty('memberType');
		expect(updateInput).not.toHaveProperty('memberStatus');
		expect(updateInput).not.toHaveProperty('memberPoints');
		expect(updateInput).not.toHaveProperty('memberPassword');
		expect(updateInput).toEqual({ _id: 'member1', memberNick: 'newNick' });
	});
});
