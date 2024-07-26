import { Injectable } from '@nestjs/common';
import { Test } from '@prisma/client';
import { Response } from 'express';
import { EntryTestDto } from 'src/dtos/test_dto/entry.test.dto';
import { PrismaService } from 'src/prisma.service';
import { customError } from 'src/utils/util.functions';

@Injectable()
export class TestService {
  constructor(private prisma: PrismaService) {}

  async createEntryTest(
    testData: EntryTestDto[],
    response: Response,
  ): Promise<void> {
    try {
      const alreadyExists = await this.prisma.test.findFirst({
        where: { type: 'Psychometric' },
      });

      if (alreadyExists)
        return customError(
          response,
          'Psychometric test already exists, try editing it.',
        );

      const questionsData = testData.map((td) => ({
        question: td.question,
        correctAnswer: td.correctAnswer,
        options: td.options,
      }));

      await this.prisma.test.create({
        data: {
          data: {
            create: questionsData,
          },
          type: 'Psychometric',
        },
        include: { data: true },
      });

      response.json({
        success: 'Test Created Successfully',
      });
    } catch (error) {
      response.json({
        error,
      });
    }
  }

  async getEntryTest(response: Response): Promise<Test | void> {
    try {
      const psychometricTest = await this.prisma.test.findFirst({
        where: { type: 'Psychometric' },
        select: { data: true, _count: true },
      });

      if (!psychometricTest)
        return customError(
          response,
          "Sorry for the inconvenience, Psychometric test doesn't exist yet.",
        );

      response.json({
        psychometricTest,
      });
    } catch (error) {
      response.json({
        error,
      });
    }
  }

  async takeEntryTest(
    email: string,
    testData: EntryTestDto[],
    response: Response,
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) return customError(response, "User doesn't exist");

      if (user?.psychometric)
        return customError(
          response,
          `You can attemp the psychometric test only once. Your result was ${user.psychometric.toFixed(2)}%`,
        );

      const psychometricTest = await this.prisma.test.findFirst({
        where: { type: 'Psychometric' },
        include: { _count: true },
      });

      if (!psychometricTest)
        return customError(
          response,
          "Sorry for the inconvenience, Psychometric test doesn't exist yet.",
        );

      let result = 0;

      testData.map((td) => td.correctAnswer === td.userAnswer && result++);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          psychometric: (result / psychometricTest._count.data) * 100,
        },
      });

      response.json({
        success: 'Congratulations for taking the test.',
        result: `${((result / psychometricTest._count.data) * 100).toFixed(2)}%`,
      });
    } catch (error) {
      response.json({
        error,
      });
    }
  }

  async createPrivateTest(
    email: string,
    testData: EntryTestDto[],
    response: Response,
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) return customError(response, "User doesn't exist");

      const questionsData = testData.map((td) => ({
        question: td.question,
        correctAnswer: td.correctAnswer,
        options: td.options,
      }));

      await this.prisma.test.create({
        data: {
          data: {
            create: questionsData,
          },
          user: { connect: { id: user?.id } },
        },
        include: { data: true },
      });

      response.json({
        success: 'Test Created Successfully',
      });
    } catch (error) {
      response.json({
        error,
      });
    }
  }

  async getPrivateTest(
    testId: string,
    response: Response,
  ): Promise<Test | void> {
    try {
      const test = await this.prisma.test.findUnique({
        where: {
          id: testId,
        },
        select: { data: true, _count: true },
      });

      if (!test) return customError(response, 'No Test Found');

      response.json({
        test,
      });
    } catch (error) {
      response.json({
        error,
      });
    }
  }

  async takePrivateTest(
    testId: string,
    email: string,
    testData: EntryTestDto[],
    response: Response,
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) return customError(response, "User doesn't exist");

      const test = await this.prisma.test.findUnique({
        where: {
          id: testId,
        },
        include: { _count: true, data: true },
      });

      if (!test) return customError(response, 'No Test Found');

      let result = 0;

      const updateAnswers = test.data.map((td, index) => {
        if (td.correctAnswer === testData[index]?.userAnswer) result++;
        return {
          ...td,
          userAnswer: testData[index]?.userAnswer,
        };
      });

      const updatePromises = updateAnswers.map(async (ua) => {
        await this.prisma.question.update({
          where: { id: ua.id },
          data: { userAnswer: ua.userAnswer },
        });
      });

      await Promise.all(updatePromises);

      await this.prisma.test.update({
        where: { id: testId },
        data: {
          result: (result / test?._count.data) * 100,
        },
      });

      response.json({
        success: 'Congratulations for taking the test.',
        result: `${((result / test._count.data) * 100).toFixed(2)}%`,
      });
    } catch (error) {
      response.json({
        error,
      });
    }
  }
}
