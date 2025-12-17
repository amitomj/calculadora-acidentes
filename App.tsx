
import React, { useState, useCallback, useMemo } from 'react';
import { RATE_TABLE, IAS_TABLE, PENSION_UPDATE_COEFFICIENTS } from './constants';
import { numberToWordsPT } from './utils/numberToWordsPT';

// --- HELPER COMPONENTS (used by calculators) ---

interface CalculationExplanationProps {
  title: string;
  children: React.ReactNode;
}

const CalculationExplanation: React.FC<CalculationExplanationProps> = ({ title, children }) => (
  <div className="mb-8 p-5 bg-slate-800/50 border-l-4 border-blue-500 rounded-r-xl text-slate-300 text-sm leading-relaxed shadow-inner">
    <div className="flex items-center mb-2 text-blue-400 font-bold uppercase tracking-wider text-xs">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Metodologia e Base Legal: {title}
    </div>
    {children}
  </div>
);

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}
const InputGroup: React.FC<InputGroupProps> = ({ label, id, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="mb-2 font-semibold text-slate-300">{label}</label>
    <input 
      id={id} 
      {...props}
      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
  </div>
);

interface ResultCardProps {
  label: string;
  value: string;
}
const ResultCard: React.FC<ResultCardProps> = ({ label, value }) => (
  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
    <p className="text-sm font-medium text-slate-400">{label}</p>
    <p className="text-2xl font-bold text-blue-400 mt-1">{value}</p>
  </div>
);

interface SummaryTextProps {
  workerName: string;
  incapacityPercentage: number;
  dischargeDate: Date;
  annualPension: number;
  annualPensionInWords: string;
  pensionStartDate: Date;
  pensionDue: number;
  redemptionCapital: number;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date) => string;
}

const SummaryText: React.FC<SummaryTextProps> = ({ 
  workerName, incapacityPercentage, dischargeDate, annualPension, annualPensionInWords, 
  pensionStartDate, pensionDue, redemptionCapital, formatCurrency, formatDate 
}) => {
  return (
    <div className="text-slate-300 leading-relaxed bg-slate-900 p-6 rounded-lg border border-slate-700">
      <p>
        O sinistrado <strong className="text-slate-100">{workerName}</strong> foi vítima de acidente de trabalho do qual resultou uma IPP de <strong className="text-slate-100">{incapacityPercentage.toLocaleString('pt-PT')}%</strong>.
      </p>
      <p className="mt-2">
        Teve alta em <strong className="text-slate-100">{formatDate(dischargeDate)}</strong>.
      </p>
      <p className="mt-2">
        Tem direito à pensão anual de <strong className="text-slate-100">{formatCurrency(annualPension)} ({annualPensionInWords})</strong> a partir de <strong className="text-slate-100">{formatDate(pensionStartDate)}</strong>, a qual até ao momento venceu <strong className="text-slate-100">{formatCurrency(pensionDue)}</strong>.
      </p>
      <p className="mt-2">
        A esta pensão corresponde o valor do capital de remição de <strong className="text-slate-100">{formatCurrency(redemptionCapital)}</strong>.
      </p>
    </div>
  );
};

interface AbsoluteSummaryTextProps {
  workerName: string;
  dischargeDate: Date;
  annualPension: number;
  annualPensionInWords: string;
  pensionStartDate: Date;
  pensionDue: number;
  redemptionCapital: number;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date) => string;
}

const AbsoluteIncapacitySummaryText: React.FC<AbsoluteSummaryTextProps> = ({ 
  workerName, dischargeDate, annualPension, annualPensionInWords, 
  pensionStartDate, pensionDue, redemptionCapital, formatCurrency, formatDate 
}) => {
  return (
    <div className="text-slate-300 leading-relaxed bg-slate-900 p-6 rounded-lg border border-slate-700">
      <p>
        O sinistrado <strong className="text-slate-100">{workerName}</strong> foi vítima de acidente de trabalho do qual resultou uma Incapacidade Permanente Absoluta para todo e qualquer trabalho.
      </p>
      <p className="mt-2">
        Teve alta em <strong className="text-slate-100">{formatDate(dischargeDate)}</strong>.
      </p>
      <p className="mt-2">
        Tem direito à pensão anual de <strong className="text-slate-100">{formatCurrency(annualPension)} ({annualPensionInWords})</strong> a partir de <strong className="text-slate-100">{formatDate(pensionStartDate)}</strong>, a qual até ao momento venceu <strong className="text-slate-100">{formatCurrency(pensionDue)}</strong>.
      </p>
      <p className="mt-2">
        A esta pensão corresponde o valor do capital de remição de <strong className="text-slate-100">{formatCurrency(redemptionCapital)}</strong>.
      </p>
    </div>
  );
};

const HabitualWorkSummaryText: React.FC<SummaryTextProps> = ({ 
  workerName, incapacityPercentage, dischargeDate, annualPension, annualPensionInWords, 
  pensionStartDate, pensionDue, redemptionCapital, formatCurrency, formatDate 
}) => {
  return (
    <div className="text-slate-300 leading-relaxed bg-slate-900 p-6 rounded-lg border border-slate-700">
      <p>
        O sinistrado <strong className="text-slate-100">{workerName}</strong> foi vítima de acidente de trabalho do qual resultou uma Incapacidade Permanente Absoluta para o trabalho habitual de <strong className="text-slate-100">{incapacityPercentage.toLocaleString('pt-PT')}%</strong>.
      </p>
      <p className="mt-2">
        Teve alta em <strong className="text-slate-100">{formatDate(dischargeDate)}</strong>.
      </p>
      <p className="mt-2">
        Tem direito à pensão anual de <strong className="text-slate-100">{formatCurrency(annualPension)} ({annualPensionInWords})</strong> a partir de <strong className="text-slate-100">{formatDate(pensionStartDate)}</strong>, a qual até ao momento venceu <strong className="text-slate-100">{formatCurrency(pensionDue)}</strong>.
      </p>
      <p className="mt-2">
        A esta pensão corresponde o valor do capital de remição de <strong className="text-slate-100">{formatCurrency(redemptionCapital)}</strong>.
      </p>
    </div>
  );
};


// --- CALCULATOR COMPONENTS ---

const BackButton: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <button onClick={onBack} className="mb-6 text-blue-400 hover:text-blue-300 font-semibold flex items-center group" aria-label="Voltar ao menu">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
    Voltar ao menu
  </button>
);

interface FormData {
  workerName: string;
  annualRemuneration: string;
  incapacityPercentage: string;
  dischargeDate: string;
  birthDate: string;
}

interface Results {
  annualPension: number;
  pensionDue: number;
  redemptionCapital: number;
  pensionStartDate: Date;
}

const initialFormData: FormData = {
  workerName: '',
  annualRemuneration: '',
  incapacityPercentage: '',
  dischargeDate: '',
  birthDate: '',
};

const PartialPermanentIncapacityCalculator: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setResults(null);
    setError('');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setResults(null);

    const { workerName, annualRemuneration, incapacityPercentage, dischargeDate, birthDate } = formData;
    
    if (!workerName || !annualRemuneration || !incapacityPercentage || !dischargeDate || !birthDate) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    const remuneration = parseFloat(annualRemuneration);
    const incapacity = parseFloat(incapacityPercentage);
    const discharge = new Date(dischargeDate);
    const birth = new Date(birthDate);

    if (isNaN(remuneration) || isNaN(incapacity) || isNaN(discharge.getTime()) || isNaN(birth.getTime())) {
      setError('Por favor, verifique os valores numéricos e as datas.');
      return;
    }
     if (remuneration <= 0 || incapacity <= 0 || incapacity > 100) {
      setError('Os valores de retribuição e incapacidade devem ser positivos. A incapacidade não pode exceder 100%.');
      return;
    }
    if (birth >= discharge) {
      setError('A data de nascimento deve ser anterior à data da alta.');
      return;
    }

    const annualPension = remuneration * 0.70 * (incapacity / 100);

    let ageAtDischarge = discharge.getFullYear() - birth.getFullYear();
    const monthDiff = discharge.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && discharge.getDate() < birth.getDate())) {
      ageAtDischarge--;
    }

    const lastBirthday = new Date(discharge.getFullYear(), birth.getMonth(), birth.getDate());
    if (lastBirthday > discharge) {
      lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
    }
    
    const nextBirthday = new Date(lastBirthday.getFullYear() + 1, lastBirthday.getMonth(), lastBirthday.getDate());

    const diffToLast = discharge.getTime() - lastBirthday.getTime();
    const diffToNext = nextBirthday.getTime() - discharge.getTime();
    
    const ageForRate = diffToNext < diffToLast ? ageAtDischarge + 1 : ageAtDischarge;
    
    const rate = RATE_TABLE[ageForRate];
    if (!rate) {
      setError(`Não foi encontrada uma taxa para a idade calculada de ${ageForRate} anos. Verifique as datas.`);
      return;
    }

    const redemptionCapital = annualPension * rate;

    const pensionStartDate = new Date(dischargeDate);
    pensionStartDate.setDate(pensionStartDate.getDate() + 1);
    pensionStartDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pensionDue = 0;
    if (today >= pensionStartDate) {
      const diffTime = today.getTime() - pensionStartDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const dailyPension = annualPension / 365;
      pensionDue = diffDays * dailyPension;
    }
    
    setResults({
      annualPension,
      pensionDue,
      redemptionCapital,
      pensionStartDate
    });

  }, [formData]);

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  
  const formatDate = (date: Date) => 
    date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Incapacidade Permanente Parcial</h1>
        <p className="text-slate-400 mt-2 text-lg">Cálculo de Pensão e Remição</p>
      </header>
      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
        <CalculationExplanation title="Pensão IPP Parcial">
          <p>Nos termos do Art. 48.º, n.º 3, al. c) da NLAT, a pensão anual é calculada como <strong>70% da retribuição anual base</strong>, multiplicada pela percentagem de incapacidade (IPP). Para o capital de remição, aplica-se a tabela da Portaria 11/2000, multiplicando a pensão anual pelo coeficiente correspondente à idade do sinistrado na data da alta.</p>
        </CalculationExplanation>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Nome do Sinistrado" id="workerName" name="workerName" value={formData.workerName} onChange={handleInputChange} placeholder="Nome completo" />
            <InputGroup label="Retribuição Anual Ilíquida (€)" id="annualRemuneration" name="annualRemuneration" type="number" value={formData.annualRemuneration} onChange={handleInputChange} placeholder="Ex: 14000" />
            <InputGroup label="Incapacidade Fixada (%)" id="incapacityPercentage" name="incapacityPercentage" type="number" value={formData.incapacityPercentage} onChange={handleInputChange} placeholder="Ex: 7.5" />
            <InputGroup label="Data da Alta" id="dischargeDate" name="dischargeDate" type="date" value={formData.dischargeDate} onChange={handleInputChange} />
            <InputGroup label="Data de Nascimento" id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
          </div>
          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg mt-6 text-center">{error}</p>}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-700">
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              Calcular
            </button>
            <button type="button" onClick={handleReset} className="w-full sm:w-auto bg-slate-600 text-slate-200 font-semibold py-3 px-8 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200">
              Limpar
            </button>
          </div>
        </form>
      </main>
      {results && (
        <section className="mt-10 bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">Resultados do Cálculo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <ResultCard label="Pensão Anual" value={formatCurrency(results.annualPension)} />
            <ResultCard label="Valor em Dívida" value={formatCurrency(results.pensionDue)} />
            <ResultCard label="Capital de Remição" value={formatCurrency(results.redemptionCapital)} />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700">
            <SummaryText
              workerName={formData.workerName}
              incapacityPercentage={parseFloat(formData.incapacityPercentage)}
              dischargeDate={new Date(formData.dischargeDate)}
              annualPension={results.annualPension}
              annualPensionInWords={numberToWordsPT(results.annualPension)}
              pensionStartDate={results.pensionStartDate}
              pensionDue={results.pensionDue}
              redemptionCapital={results.redemptionCapital}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </div>
        </section>
      )}
    </div>
  );
};

interface AbsoluteIncapacityFormData {
  workerName: string;
  annualRemuneration: string;
  dischargeDate: string;
  birthDate: string;
  dependents: 'none' | 'one' | 'two_or_more';
}

const initialAbsoluteFormData: AbsoluteIncapacityFormData = {
  workerName: '',
  annualRemuneration: '',
  dischargeDate: '',
  birthDate: '',
  dependents: 'none',
};

const AbsolutePermanentTotalIncapacityCalculator: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  const [formData, setFormData] = useState<AbsoluteIncapacityFormData>(initialAbsoluteFormData);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);
  
  const handleReset = useCallback(() => {
    setFormData(initialAbsoluteFormData);
    setResults(null);
    setError('');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setResults(null);

    const { workerName, annualRemuneration, dischargeDate, birthDate, dependents } = formData;
    
    if (!workerName || !annualRemuneration || !dischargeDate || !birthDate) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    const remuneration = parseFloat(annualRemuneration);
    const discharge = new Date(dischargeDate);
    const birth = new Date(birthDate);

    if (isNaN(remuneration) || isNaN(discharge.getTime()) || isNaN(birth.getTime())) {
      setError('Por favor, verifique os valores numéricos e as datas.');
      return;
    }
     if (remuneration <= 0) {
      setError('O valor de retribuição deve ser positivo.');
      return;
    }
    if (birth >= discharge) {
      setError('A data de nascimento deve ser anterior à data da alta.');
      return;
    }

    let pensionFactor = 0.80;
    if (dependents === 'one') {
      pensionFactor = 0.90;
    } else if (dependents === 'two_or_more') {
      pensionFactor = 1.0;
    }
    const annualPension = remuneration * pensionFactor;

    let ageAtDischarge = discharge.getFullYear() - birth.getFullYear();
    const monthDiff = discharge.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && discharge.getDate() < birth.getDate())) {
      ageAtDischarge--;
    }

    const lastBirthday = new Date(discharge.getFullYear(), birth.getMonth(), birth.getDate());
    if (lastBirthday > discharge) {
      lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
    }
    
    const nextBirthday = new Date(lastBirthday.getFullYear() + 1, lastBirthday.getMonth(), lastBirthday.getDate());

    const diffToLast = discharge.getTime() - lastBirthday.getTime();
    const diffToNext = nextBirthday.getTime() - discharge.getTime();
    
    const ageForRate = diffToNext < diffToLast ? ageAtDischarge + 1 : ageAtDischarge;
    
    const rate = RATE_TABLE[ageForRate];
    if (!rate) {
      setError(`Não foi encontrada uma taxa para a idade calculada de ${ageForRate} anos. Verifique as datas.`);
      return;
    }

    const redemptionCapital = annualPension * rate;

    const pensionStartDate = new Date(dischargeDate);
    pensionStartDate.setDate(pensionStartDate.getDate() + 1);
    pensionStartDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pensionDue = 0;
    if (today >= pensionStartDate) {
      const diffTime = today.getTime() - pensionStartDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const dailyPension = annualPension / 365;
      pensionDue = diffDays * dailyPension;
    }
    
    setResults({
      annualPension,
      pensionDue,
      redemptionCapital,
      pensionStartDate
    });

  }, [formData]);

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  
  const formatDate = (date: Date) => 
    date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">IPP Absoluta (Qualquer Trabalho)</h1>
        <p className="text-slate-400 mt-2 text-lg">Acidentes de Trabalho</p>
      </header>
      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
        <CalculationExplanation title="Incapacidade Absoluta Total">
          <p>De acordo com o Art. 48.º, n.º 3, al. a) da NLAT, a pensão anual é de <strong>80% da retribuição</strong>, acrescida de 10% por cada pessoa a cargo (até ao limite de 100% da retribuição).</p>
        </CalculationExplanation>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Nome do Sinistrado" id="workerName" name="workerName" value={formData.workerName} onChange={handleInputChange} placeholder="Nome completo" />
            <InputGroup label="Retribuição Anual Ilíquida (€)" id="annualRemuneration" name="annualRemuneration" type="number" value={formData.annualRemuneration} onChange={handleInputChange} placeholder="Ex: 14000" />
            <InputGroup label="Data da Alta" id="dischargeDate" name="dischargeDate" type="date" value={formData.dischargeDate} onChange={handleInputChange} />
            <InputGroup label="Data de Nascimento" id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
            <div className="md:col-span-2">
              <fieldset>
                <legend className="mb-2 font-semibold text-slate-300">Pessoas a cargo</legend>
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2">
                  <div className="flex items-center">
                    <input type="radio" id="dependents_none" name="dependents" value="none" checked={formData.dependents === 'none'} onChange={handleInputChange} className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500" />
                    <label htmlFor="dependents_none" className="ml-3 text-slate-300">Nenhuma</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="dependents_one" name="dependents" value="one" checked={formData.dependents === 'one'} onChange={handleInputChange} className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500" />
                    <label htmlFor="dependents_one" className="ml-3 text-slate-300">Uma</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="dependents_two_or_more" name="dependents" value="two_or_more" checked={formData.dependents === 'two_or_more'} onChange={handleInputChange} className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500" />
                    <label htmlFor="dependents_two_or_more" className="ml-3 text-slate-300">Duas ou mais</label>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg mt-6 text-center">{error}</p>}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-700">
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              Calcular
            </button>
            <button type="button" onClick={handleReset} className="w-full sm:w-auto bg-slate-600 text-slate-200 font-semibold py-3 px-8 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200">
              Limpar
            </button>
          </div>
        </form>
      </main>
      {results && (
        <section className="mt-10 bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">Resultados do Cálculo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <ResultCard label="Pensão Anual" value={formatCurrency(results.annualPension)} />
            <ResultCard label="Valor em Dívida" value={formatCurrency(results.pensionDue)} />
            <ResultCard label="Capital de Remição" value={formatCurrency(results.redemptionCapital)} />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700">
            <AbsoluteIncapacitySummaryText
              workerName={formData.workerName}
              dischargeDate={new Date(formData.dischargeDate)}
              annualPension={results.annualPension}
              annualPensionInWords={numberToWordsPT(results.annualPension)}
              pensionStartDate={results.pensionStartDate}
              pensionDue={results.pensionDue}
              redemptionCapital={results.redemptionCapital}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </div>
        </section>
      )}
    </div>
  );
};

const AbsoluteHabitualWorkIncapacityCalculator: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setResults(null);
    setError('');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setResults(null);

    const { workerName, annualRemuneration, incapacityPercentage, dischargeDate, birthDate } = formData;
    
    if (!workerName || !annualRemuneration || !incapacityPercentage || !dischargeDate || !birthDate) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    const remuneration = parseFloat(annualRemuneration);
    const incapacity = parseFloat(incapacityPercentage);
    const discharge = new Date(dischargeDate);
    const birth = new Date(birthDate);

    if (isNaN(remuneration) || isNaN(incapacity) || isNaN(discharge.getTime()) || isNaN(birth.getTime())) {
      setError('Por favor, verifique os valores numéricos e as datas.');
      return;
    }
     if (remuneration <= 0 || incapacity <= 0 || incapacity > 100) {
      setError('Os valores de retribuição e incapacidade devem ser positivos. A incapacidade não pode exceder 100%.');
      return;
    }
    if (birth >= discharge) {
      setError('A data de nascimento deve ser anterior à data da alta.');
      return;
    }

    const highLimit = remuneration * 0.70;
    const lowLimit = remuneration * 0.50;
    const difference = highLimit - lowLimit;
    const incapacityFactor = difference * (incapacity / 100);
    const annualPension = lowLimit + incapacityFactor;

    let ageAtDischarge = discharge.getFullYear() - birth.getFullYear();
    const monthDiff = discharge.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && discharge.getDate() < birth.getDate())) {
      ageAtDischarge--;
    }

    const lastBirthday = new Date(discharge.getFullYear(), birth.getMonth(), birth.getDate());
    if (lastBirthday > discharge) {
      lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
    }
    
    const nextBirthday = new Date(lastBirthday.getFullYear() + 1, lastBirthday.getMonth(), lastBirthday.getDate());

    const diffToLast = discharge.getTime() - lastBirthday.getTime();
    const diffToNext = nextBirthday.getTime() - discharge.getTime();
    
    const ageForRate = diffToNext < diffToLast ? ageAtDischarge + 1 : ageAtDischarge;
    
    const rate = RATE_TABLE[ageForRate];
    if (!rate) {
      setError(`Não foi encontrada uma taxa para a idade calculada de ${ageForRate} anos. Verifique as datas.`);
      return;
    }

    const redemptionCapital = annualPension * rate;

    const pensionStartDate = new Date(dischargeDate);
    pensionStartDate.setDate(pensionStartDate.getDate() + 1);
    pensionStartDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pensionDue = 0;
    if (today >= pensionStartDate) {
      const diffTime = today.getTime() - pensionStartDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const dailyPension = annualPension / 365;
      pensionDue = diffDays * dailyPension;
    }
    
    setResults({
      annualPension,
      pensionDue,
      redemptionCapital,
      pensionStartDate
    });

  }, [formData]);

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  
  const formatDate = (date: Date) => 
    date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">IPP Absoluta (Trabalho Habitual)</h1>
        <p className="text-slate-400 mt-2 text-lg">Acidentes de Trabalho</p>
      </header>
      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
        <CalculationExplanation title="Incapacidade Absoluta Habitual">
          <p>Nos termos do Art. 48.º, n.º 3, al. b) da NLAT, a pensão anual situa-se entre <strong>50% e 70% da retribuição</strong>, atendendo à capacidade funcional residual para o exercício de outra profissão compatível. A fórmula interpolada é: 50% R + (IPP% x 20% R).</p>
        </CalculationExplanation>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Nome do Sinistrado" id="workerName" name="workerName" value={formData.workerName} onChange={handleInputChange} placeholder="Nome completo" />
            <InputGroup label="Retribuição Anual Ilíquida (€)" id="annualRemuneration" name="annualRemuneration" type="number" value={formData.annualRemuneration} onChange={handleInputChange} placeholder="Ex: 14000" />
            <InputGroup label="Incapacidade Fixada (%)" id="incapacityPercentage" name="incapacityPercentage" type="number" value={formData.incapacityPercentage} onChange={handleInputChange} placeholder="Ex: 42.07" />
            <InputGroup label="Data da Alta" id="dischargeDate" name="dischargeDate" type="date" value={formData.dischargeDate} onChange={handleInputChange} />
            <InputGroup label="Data de Nascimento" id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
          </div>
          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg mt-6 text-center">{error}</p>}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-700">
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              Calcular
            </button>
            <button type="button" onClick={handleReset} className="w-full sm:w-auto bg-slate-600 text-slate-200 font-semibold py-3 px-8 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200">
              Limpar
            </button>
          </div>
        </form>
      </main>
      {results && (
        <section className="mt-10 bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">Resultados do Cálculo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <ResultCard label="Pensão Anual" value={formatCurrency(results.annualPension)} />
            <ResultCard label="Valor em Dívida" value={formatCurrency(results.pensionDue)} />
            <ResultCard label="Capital de Remição" value={formatCurrency(results.redemptionCapital)} />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700">
            <HabitualWorkSummaryText
              workerName={formData.workerName}
              incapacityPercentage={parseFloat(formData.incapacityPercentage)}
              dischargeDate={new Date(formData.dischargeDate)}
              annualPension={results.annualPension}
              annualPensionInWords={numberToWordsPT(results.annualPension)}
              pensionStartDate={results.pensionStartDate}
              pensionDue={results.pensionDue}
              redemptionCapital={results.redemptionCapital}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </div>
        </section>
      )}
    </div>
  );
};

// --- NEW: Unified Temporary Incapacity Calculator ---

type IncapacityType = 'absolute' | 'partial';

interface Period {
  id: number;
  startDate: string;
  endDate: string;
  type: IncapacityType;
  incapacityPercentage: string;
}

interface TemporaryIncapacityFormData {
  workerName: string;
  annualRemuneration: string;
  periods: Period[];
}

const initialTemporaryFormData: TemporaryIncapacityFormData = {
  workerName: '',
  annualRemuneration: '',
  periods: [{ id: 1, startDate: '', endDate: '', type: 'absolute', incapacityPercentage: '' }],
};

interface PeriodResult {
  id: number;
  days: number;
  compensation: number;
  type: IncapacityType;
  startDate: Date;
  endDate: Date;
}

interface TemporaryIncapacityResults {
  totalCompensation: number;
  totalDays: number;
  dailyRemuneration: number;
  periodResults: PeriodResult[];
}

interface TemporarySummaryTextProps {
    workerName: string;
    results: TemporaryIncapacityResults;
    formatCurrency: (value: number) => string;
    formatDate: (date: Date) => string;
}

const TemporarySummaryText: React.FC<TemporarySummaryTextProps> = ({ 
  workerName, results, formatCurrency, formatDate 
}) => {
  return (
    <div className="text-slate-300 leading-relaxed bg-slate-900 p-6 rounded-lg border border-slate-700">
      <p>
        O sinistrado <strong className="text-slate-100">{workerName}</strong> esteve com incapacidade temporária durante <strong className="text-slate-100">{results.totalDays}</strong> dias, resultando numa indemnização total de <strong className="text-slate-100">{formatCurrency(results.totalCompensation)}</strong>.
      </p>
      <p className="mt-4">Resumo por período:</p>
      <ul className="list-disc list-inside mt-2 pl-2 space-y-2">
        {results.periodResults.map((period, index) => (
          <li key={index}>
            Período de <strong className="text-slate-100">{formatDate(period.startDate)}</strong> a <strong className="text-slate-100">{formatDate(period.endDate)}</strong> ({period.days} dias, {period.type === 'absolute' ? 'Absoluta' : 'Parcial'}): <strong className="text-slate-100">{formatCurrency(period.compensation)}</strong>.
          </li>
        ))}
      </ul>
    </div>
  );
};


const TemporaryIncapacityCalculator: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  const [formData, setFormData] = useState<TemporaryIncapacityFormData>(initialTemporaryFormData);
  const [results, setResults] = useState<TemporaryIncapacityResults | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePeriodChange = useCallback((id: number, field: keyof Omit<Period, 'id'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      periods: prev.periods.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  }, []);

  const addPeriod = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      periods: [...prev.periods, { id: Date.now(), startDate: '', endDate: '', type: 'absolute', incapacityPercentage: '' }]
    }));
  }, []);

  const removePeriod = useCallback((id: number) => {
    if (formData.periods.length > 1) {
      setFormData(prev => ({
        ...prev,
        periods: prev.periods.filter(p => p.id !== id)
      }));
    }
  }, [formData.periods.length]);
  
  const handleReset = useCallback(() => {
    setFormData(initialTemporaryFormData);
    setResults(null);
    setError('');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setResults(null);

    const { workerName, annualRemuneration, periods } = formData;
    
    if (!workerName || !annualRemuneration || periods.some(p => !p.startDate || !p.endDate)) {
      setError('Os campos de nome, retribuição e todas as das de período são obrigatórios.');
      return;
    }
    
    if (periods.some(p => p.type === 'partial' && !p.incapacityPercentage)) {
        setError('Para períodos de incapacidade parcial, a percentagem de incapacidade deve ser preenchida.');
        return;
    }

    const remuneration = parseFloat(annualRemuneration);
    if (isNaN(remuneration) || remuneration <= 0) {
      setError('O valor de retribuição deve ser um número positivo.');
      return;
    }

    const dailyRemuneration = remuneration / 365;
    let totalCompensation = 0;
    let totalDays = 0;
    const periodResults: PeriodResult[] = [];

    for (const period of periods) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        setError(`Datas inválidas no período de ${period.startDate || 'início'} a ${period.endDate || 'fim'}. A data de fim deve ser posterior à de início.`);
        return;
      }

      const diffTime = end.getTime() - start.getTime();
      const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
      let periodCompensation = 0;

      if (period.type === 'absolute') {
          if (days <= 365) {
              periodCompensation = days * dailyRemuneration * 0.70;
          } else {
              const comp70 = 365 * dailyRemuneration * 0.70;
              const comp75 = (days - 365) * dailyRemuneration * 0.75;
              periodCompensation = comp70 + comp75;
          }
      } else if (period.type === 'partial') {
          const incapacity = parseFloat(period.incapacityPercentage);
          if (isNaN(incapacity) || incapacity <= 0 || incapacity > 100) {
            setError(`A percentagem de incapacidade para o período de ${period.startDate} a ${period.endDate} é inválida. Deve ser um número entre 0 e 100.`);
            return;
          }
          periodCompensation = dailyRemuneration * (incapacity / 100) * 0.70 * days;
      }
      
      totalCompensation += periodCompensation;
      totalDays += days;
      periodResults.push({ id: period.id, days, compensation: periodCompensation, type: period.type, startDate: start, endDate: end });
    }
    
    setResults({
      totalCompensation,
      totalDays,
      dailyRemuneration,
      periodResults,
    });

  }, [formData]);

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  
  const formatDate = (date: Date) => 
    date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Incapacidade Temporária</h1>
        <p className="text-slate-400 mt-2 text-lg">Absoluta e Parcial</p>
      </header>
      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
        <CalculationExplanation title="Indemnizações Temporárias">
          <p>Nos termos do Art. 48.º, n.º 3, al. d) e e) da NLAT, a indemnização diária por incapacidade temporária absoluta (ITA) é de <strong>70% da retribuição diária</strong> nos primeiros 12 meses, subindo para <strong>75%</strong> após esse período. No caso de incapacidade temporária parcial (ITP), a indemnização é de 70% da redução da capacidade de ganho.</p>
        </CalculationExplanation>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <InputGroup label="Nome do Sinistrado" id="workerName" name="workerName" value={formData.workerName} onChange={handleInputChange} placeholder="Nome completo" />
            <InputGroup label="Retribuição Anual Ilíquida (€)" id="annualRemuneration" name="annualRemuneration" type="number" value={formData.annualRemuneration} onChange={handleInputChange} placeholder="Ex: 14000" />
          </div>

          <h3 className="text-xl font-semibold text-slate-200 mt-8 mb-4 pt-6 border-t border-slate-700">Períodos de Incapacidade</h3>
          <div className="space-y-6">
            {formData.periods.map((period, index) => (
              <div key={period.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-300">Período {index + 1}</h4>
                  {formData.periods.length > 1 && (
                    <button type="button" onClick={() => removePeriod(period.id)} className="text-red-400 hover:text-red-300 text-sm font-medium" aria-label={`Remover Período ${index + 1}`}>
                      Remover
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor={`startDate_${period.id}`} className="mb-2 text-sm font-semibold text-slate-400">Data de Início</label>
                    <input id={`startDate_${period.id}`} name="startDate" type="date" value={period.startDate} onChange={(e) => handlePeriodChange(period.id, 'startDate', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                   <div className="flex flex-col">
                    <label htmlFor={`endDate_${period.id}`} className="mb-2 text-sm font-semibold text-slate-400">Data de Fim</label>
                    <input id={`endDate_${period.id}`} name="endDate" type="date" value={period.endDate} onChange={(e) => handlePeriodChange(period.id, 'endDate', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor={`type_${period.id}`} className="mb-2 text-sm font-semibold text-slate-400">Tipo</label>
                    <select id={`type_${period.id}`} name="type" value={period.type} onChange={(e) => handlePeriodChange(period.id, 'type', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="absolute">Absoluta</option>
                      <option value="partial">Parcial</option>
                    </select>
                  </div>
                </div>
                {period.type === 'partial' && (
                  <div className="mt-4">
                    <div className="flex flex-col">
                      <label htmlFor={`incapacityPercentage_${period.id}`} className="mb-2 text-sm font-semibold text-slate-400">Incapacidade Fixada (%)</label>
                      <input 
                        id={`incapacityPercentage_${period.id}`} 
                        name="incapacityPercentage" 
                        type="number" 
                        value={period.incapacityPercentage} 
                        onChange={(e) => handlePeriodChange(period.id, 'incapacityPercentage', e.target.value)} 
                        placeholder="Ex: 15"
                        className="w-full sm:w-1/2 md:w-1/3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button type="button" onClick={addPeriod} className="w-full sm:w-auto text-blue-400 font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
              + Adicionar Período
            </button>
          </div>

          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg mt-6 text-center">{error}</p>}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-700">
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              Calcular
            </button>
            <button type="button" onClick={handleReset} className="w-full sm:w-auto bg-slate-600 text-slate-200 font-semibold py-3 px-8 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200">
              Limpar
            </button>
          </div>
        </form>
      </main>
      {results && (
        <section className="mt-10 bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">Resultados do Cálculo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <ResultCard label="Nº Total de Dias" value={`${results.totalDays}`} />
            <ResultCard label="Retribuição Diária" value={formatCurrency(results.dailyRemuneration)} />
            <ResultCard label="Indemnização Total" value={formatCurrency(results.totalCompensation)} />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700">
            <TemporarySummaryText
              workerName={formData.workerName}
              results={results}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </div>
        </section>
      )}
    </div>
  );
};

// --- NEW: High Incapacity Subsidy Calculator ---

interface HighIncapacityFormData {
  workerName: string;
  accidentDate: string;
  scenario: 'absolute_total' | 'absolute_habitual' | 'partial_70';
  residualCapacityPercentage: string;
  incapacityPercentage: string;
}

const initialHighIncapacityFormData: HighIncapacityFormData = {
  workerName: '',
  accidentDate: '',
  scenario: 'absolute_total',
  residualCapacityPercentage: '',
  incapacityPercentage: '',
};

interface HighIncapacityResults {
  subsidy: number;
  iasValue: number;
}

interface HighIncapacitySummaryProps {
  workerName: string;
  results: HighIncapacityResults;
  formData: HighIncapacityFormData;
  formatCurrency: (value: number) => string;
}

const HighIncapacitySummaryText: React.FC<HighIncapacitySummaryProps> = ({ workerName, results, formData, formatCurrency }) => {
  const { scenario, incapacityPercentage, accidentDate } = formData;
  const { subsidy, iasValue } = results;
  const accidentYear = new Date(accidentDate).getFullYear();

  const baseText = `Ao sinistrado ${workerName}, vítima de acidente em ${accidentYear}, foi calculado um subsídio de ${formatCurrency(subsidy)}.`;

  let scenarioText = '';
  if (scenario === 'absolute_total') {
    scenarioText = `O cálculo baseou-se no cenário de incapacidade permanente absoluta para todo e qualquer trabalho, utilizando o valor do IAS de ${accidentYear} (${formatCurrency(iasValue)}). A fórmula aplicada foi: 12 x (1,1 x ${formatCurrency(iasValue)}).`;
  } else if (scenario === 'partial_70') {
    scenarioText = `O cálculo baseou-se no cenário de incapacidade permanente parcial de ${incapacityPercentage}%, utilizando o valor do IAS de ${accidentYear} (${formatCurrency(iasValue)}). A fórmula aplicada foi: (${formatCurrency(iasValue)} x 12) x ${incapacityPercentage}% x 1,1.`;
  }

  return (
    <div className="text-slate-300 leading-relaxed bg-slate-900 p-6 rounded-lg border border-slate-700">
      <p><strong className="text-slate-100">{baseText}</strong></p>
      <p className="mt-2 text-slate-400">{scenarioText}</p>
    </div>
  );
};


const HighIncapacitySubsidyCalculator: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  const [formData, setFormData] = useState<HighIncapacityFormData>(initialHighIncapacityFormData);
  const [results, setResults] = useState<HighIncapacityResults | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);
  
  const handleReset = useCallback(() => {
    setFormData(initialHighIncapacityFormData);
    setResults(null);
    setError('');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setResults(null);

    const { workerName, accidentDate, scenario, residualCapacityPercentage, incapacityPercentage } = formData;

    if (!workerName || !accidentDate) {
      setError('O nome do sinistrado e a data do acidente são obrigatórios.');
      return;
    }

    const accident = new Date(accidentDate);
    if (isNaN(accident.getTime())) {
        setError('A data do acidente é inválida.');
        return;
    }
    const year = accident.getFullYear();
    const iasValue = IAS_TABLE[year];

    if (!iasValue) {
        setError(`O valor do IAS para o ano de ${year} não está disponível. Por favor, insira uma data entre 2007 e 2025.`);
        return;
    }

    let subsidy = 0;

    if (scenario === 'absolute_total') {
        subsidy = 12 * (1.1 * iasValue);
    } else if (scenario === 'partial_70') {
        if (!incapacityPercentage) {
            setError('A incapacidade fixada é obrigatória para este cenário.');
            return;
        }
        const incapacity = parseFloat(incapacityPercentage);
        if (isNaN(incapacity) || incapacity < 70 || incapacity > 100) {
            setError('A incapacidade fixada deve ser um valor numérico entre 70% e 100%.');
            return;
        }
        subsidy = (iasValue * 12) * (incapacity / 100) * 1.1;
    } else if (scenario === 'absolute_habitual') {
        if (!residualCapacityPercentage) {
            setError('A capacidade funcional residual é obrigatória para este cenário.');
            return;
        }
        setError('O cálculo para incapacidade permanente absoluta para o trabalho habitual será implementado em breve.');
        return;
    }
    
    setResults({ subsidy, iasValue });

  }, [formData]);
  
  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Subsídio de Elevada Incapacidade</h1>
        <p className="text-slate-400 mt-2 text-lg">Cálculo Baseado no IAS</p>
      </header>
      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
        <CalculationExplanation title="Subsídio por Elevada Incapacidade">
          <p>Este subsídio, regulado pelo Art. 67.º da NLAT, é uma prestação paga de uma só vez. O montante baseia-se no valor do <strong>IAS (Indexante de Apoios Sociais)</strong> à data do acidente. Para incapacidade absoluta total, o valor é de 12 x (1,1 x IAS). Para incapacidade parcial (≥ 70%), o valor é proporcional à incapacidade fixada: (IAS x 12) x IPP% x 1,1.</p>
        </CalculationExplanation>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Nome do Sinistrado" id="workerName" name="workerName" value={formData.workerName} onChange={handleInputChange} placeholder="Nome completo" />
            <InputGroup label="Data do Acidente" id="accidentDate" name="accidentDate" type="date" value={formData.accidentDate} onChange={handleInputChange} />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
              <fieldset>
                <legend className="mb-4 font-semibold text-slate-200 text-lg">Selecione o cenário aplicável</legend>
                <div className="space-y-4">
                  
                  <div className="flex items-start p-4 bg-slate-900/50 rounded-lg border border-slate-700 transition-all has-[:checked]:ring-2 has-[:checked]:ring-blue-500 has-[:checked]:border-blue-500">
                    <input type="radio" id="scenario_absolute_total" name="scenario" value="absolute_total" checked={formData.scenario === 'absolute_total'} onChange={handleInputChange} className="h-5 w-5 mt-1 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500" />
                    <label htmlFor="scenario_absolute_total" className="ml-3 text-slate-300">
                        <span className="font-semibold block">Incapacidade permanente absoluta para todo e qualquer trabalho</span>
                    </label>
                  </div>

                  <div className="flex items-start p-4 bg-slate-900/50 rounded-lg border border-slate-700 transition-all has-[:checked]:ring-2 has-[:checked]:ring-blue-500 has-[:checked]:border-blue-500">
                    <input type="radio" id="scenario_absolute_habitual" name="scenario" value="absolute_habitual" checked={formData.scenario === 'absolute_habitual'} onChange={handleInputChange} className="h-5 w-5 mt-1 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500" />
                    <label htmlFor="scenario_absolute_habitual" className="ml-3 text-slate-300 w-full">
                        <span className="font-semibold block">Incapacidade permanente absoluta para o trabalho habitual</span>
                         {formData.scenario === 'absolute_habitual' && (
                            <div className="mt-3 animate-fade-in">
                                <InputGroup label="Capacidade Funcional Residual (%)" id="residualCapacityPercentage" name="residualCapacityPercentage" type="number" value={formData.residualCapacityPercentage} onChange={handleInputChange} placeholder="Ex: 25" />
                            </div>
                        )}
                    </label>
                  </div>

                  <div className="flex items-start p-4 bg-slate-900/50 rounded-lg border border-slate-700 transition-all has-[:checked]:ring-2 has-[:checked]:ring-blue-500 has-[:checked]:border-blue-500">
                    <input type="radio" id="scenario_partial_70" name="scenario" value="partial_70" checked={formData.scenario === 'partial_70'} onChange={handleInputChange} className="h-5 w-5 mt-1 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500" />
                    <label htmlFor="scenario_partial_70" className="ml-3 text-slate-300 w-full">
                        <span className="font-semibold block">Incapacidade permanente parcial igual ou superior a 70%</span>
                        {formData.scenario === 'partial_70' && (
                            <div className="mt-3 animate-fade-in">
                                <InputGroup label="Incapacidade Fixada (%)" id="incapacityPercentage" name="incapacityPercentage" type="number" value={formData.incapacityPercentage} onChange={handleInputChange} placeholder="Ex: 75" />
                            </div>
                        )}
                    </label>
                  </div>

                </div>
              </fieldset>
            </div>


          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg mt-6 text-center">{error}</p>}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-700">
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              Calcular
            </button>
            <button type="button" onClick={handleReset} className="w-full sm:w-auto bg-slate-600 text-slate-200 font-semibold py-3 px-8 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200">
              Limpar
            </button>
          </div>
        </form>
      </main>
      {results && (
        <section className="mt-10 bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">Resultados do Cálculo</h2>
          <div className="grid grid-cols-1 gap-4 text-center">
             <ResultCard label="Valor do Subsídio" value={formatCurrency(results.subsidy)} />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700">
            <HighIncapacitySummaryText
              workerName={formData.workerName}
              results={results}
              formData={formData}
              formatCurrency={formatCurrency}
            />
          </div>
        </section>
      )}
    </div>
  );
};

// --- NEW: Pension Update Calculator ---

interface PensionUpdateYearResult {
  year: number;
  coefficient: number;
  value: number;
  isInitial: boolean;
}

const PensionUpdateCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [initialValue, setInitialValue] = useState<string>('');
  const [fixingYear, setFixingYear] = useState<string>('');
  const [results, setResults] = useState<PensionUpdateYearResult[] | null>(null);
  const [error, setError] = useState<string>('');

  const handleReset = useCallback(() => {
    setInitialValue('');
    setFixingYear('');
    setResults(null);
    setError('');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResults(null);

    const val = parseFloat(initialValue);
    const year = parseInt(fixingYear);

    if (isNaN(val) || isNaN(year)) {
      setError('Por favor, insira valores válidos para a pensão e o ano.');
      return;
    }

    if (year < 1999 || year > 2025) {
      setError('O ano de fixação deve estar entre 1999 e 2025.');
      return;
    }

    const yearlyResults: PensionUpdateYearResult[] = [];
    let currentVal = val;

    // First line: Initial year
    yearlyResults.push({
      year,
      coefficient: 0,
      value: currentVal,
      isInitial: true
    });

    // Subsequent years: Update from Year + 1
    const currentYear = 2025;
    for (let y = year + 1; y <= currentYear; y++) {
      const coeff = PENSION_UPDATE_COEFFICIENTS[y] || 0;
      currentVal = currentVal * (1 + coeff / 100);
      yearlyResults.push({
        year: y,
        coefficient: coeff,
        value: currentVal,
        isInitial: false
      });
    }

    setResults(yearlyResults);
  }, [initialValue, fixingYear]);

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Atualização de Pensões</h1>
        <p className="text-slate-400 mt-2 text-lg">Cálculo cronológico de coeficientes anuais</p>
      </header>

      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
        <CalculationExplanation title="Mecanismo de Atualização">
          <p>As pensões por acidente de trabalho são atualizadas anualmente com base em coeficientes publicados pelo Governo. A primeira atualização ocorre no dia 1 de janeiro do ano seguinte ao da fixação. O cálculo é composto, incidindo cada atualização sobre o valor já atualizado do ano anterior.</p>
        </CalculationExplanation>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup 
              label="Valor Inicial da Pensão (€)" 
              id="initialValue" 
              type="number" 
              step="0.01" 
              value={initialValue} 
              onChange={(e) => setInitialValue(e.target.value)} 
              placeholder="Ex: 1000" 
            />
            <InputGroup 
              label="Ano de Fixação" 
              id="fixingYear" 
              type="number" 
              min="1999" 
              max="2025" 
              value={fixingYear} 
              onChange={(e) => setFixingYear(e.target.value)} 
              placeholder="Ex: 2020" 
            />
          </div>
          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg mt-6 text-center">{error}</p>}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-700">
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-all">
              Calcular Atualizações
            </button>
            <button type="button" onClick={handleReset} className="w-full sm:w-auto bg-slate-600 text-slate-200 font-semibold py-3 px-8 rounded-lg hover:bg-slate-500 transition-all">
              Limpar
            </button>
          </div>
        </form>
      </main>

      {results && (
        <section className="mt-10 bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700 animate-fade-in overflow-hidden">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">Progressão Anual da Pensão</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="py-3 px-4">Ano</th>
                  <th className="py-3 px-4">Coeficiente</th>
                  <th className="py-3 px-4 text-right">Valor da Pensão</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.year} className={`border-b border-slate-700/50 transition-colors hover:bg-slate-750 ${r.isInitial ? 'bg-slate-900/40 font-semibold' : ''}`}>
                    <td className="py-3 px-4 text-slate-200">{r.year} {r.isInitial && <span className="text-[10px] ml-2 px-1.5 py-0.5 bg-blue-900 text-blue-200 rounded">Fixação</span>}</td>
                    <td className="py-3 px-4 text-slate-400">{r.isInitial ? '-' : `${r.coefficient.toLocaleString('pt-PT')}%`}</td>
                    <td className={`py-3 px-4 text-right font-mono ${r.year === 2025 ? 'text-blue-400 font-bold' : 'text-slate-200'}`}>
                      {formatCurrency(r.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700 bg-slate-900/50 -mx-6 -mb-6 p-6">
            <p className="text-slate-300 text-center">
              O valor da pensão em <strong className="text-white">2025</strong> é de <strong className="text-blue-400 text-xl">{formatCurrency(results[results.length - 1].value)}</strong>.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

// --- NEW: Fatal Accident Calculator ---

interface FatalAccidentFormData {
  deceasedName: string;
  annualRemuneration: string;
  yearOfDeath: string;
  agravatedResponsibility: boolean;
  hasSpouse: boolean;
  spouseScenario: 'under_retirement' | 'over_retirement';
  hasExSpouse: boolean;
  exSpouseAlimentos: string;
  childrenCount: string;
  isDoubleOrphan: boolean;
  ascendantsCount: string;
  ascendantsScenario: 'concurent' | 'alone_under' | 'alone_over';
  funeralExpenses: string;
  isTranslation: boolean;
}

const initialFatalFormData: FatalAccidentFormData = {
  deceasedName: '',
  annualRemuneration: '',
  yearOfDeath: '2025',
  agravatedResponsibility: false,
  hasSpouse: false,
  spouseScenario: 'under_retirement',
  hasExSpouse: false,
  exSpouseAlimentos: '',
  childrenCount: '0',
  isDoubleOrphan: false,
  ascendantsCount: '0',
  ascendantsScenario: 'concurent',
  funeralExpenses: '',
  isTranslation: false,
};

interface BeneficiaryPension {
  name: string;
  standardPercentage: number;
  calculatedValue: number;
}

interface FatalResults {
  iasValue: number;
  pensions: BeneficiaryPension[];
  totalPensionValue: number;
  deathSubsidy: number;
  funeralSubsidy: number;
  remicaoSpouse: number;
  reversaoFAT: number;
}

const FatalAccidentCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formData, setFormData] = useState<FatalAccidentFormData>(initialFatalFormData);
  const [results, setResults] = useState<FatalResults | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  }, []);

  const handleReset = useCallback(() => {
    setFormData(initialFatalFormData);
    setResults(null);
    setError('');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const R = parseFloat(formData.annualRemuneration);
    const iasYear = parseInt(formData.yearOfDeath);
    const IAS = IAS_TABLE[iasYear];

    if (isNaN(R) || !IAS) {
      setError('Verifique a retribuição e o ano do acidente.');
      return;
    }

    const pensions: BeneficiaryPension[] = [];
    const unitIAS = 1.1 * IAS;

    // 1. Calculate Standard Percentages
    // Spouse
    if (formData.hasSpouse) {
      pensions.push({
        name: 'Cônjuge / Unido de Facto',
        standardPercentage: formData.spouseScenario === 'under_retirement' ? 0.30 : 0.40,
        calculatedValue: 0
      });
    }

    // Ex-Spouse
    if (formData.hasExSpouse) {
      const alimentos = parseFloat(formData.exSpouseAlimentos) || 0;
      pensions.push({
        name: 'Ex-Cônjuge (Limitado a Alimentos)',
        standardPercentage: 0.30, // Base calculation but will be capped
        calculatedValue: Math.min(alimentos, R * 0.30)
      });
    }

    // Children
    const cCount = parseInt(formData.childrenCount) || 0;
    if (cCount > 0) {
      let childBase = 0;
      if (cCount === 1) childBase = 0.20;
      else if (cCount === 2) childBase = 0.40;
      else childBase = 0.50;

      const orphanMultiplier = formData.isDoubleOrphan ? 2 : 1;
      const totalChildPerc = Math.min(0.80, childBase * orphanMultiplier);

      pensions.push({
        name: `Filhos / Enteados (${cCount})`,
        standardPercentage: totalChildPerc,
        calculatedValue: 0
      });
    }

    // Ascendants
    const aCount = parseInt(formData.ascendantsCount) || 0;
    if (aCount > 0) {
      let aPerc = 0;
      let label = 'Ascendentes';
      if (formData.ascendantsScenario === 'concurent') {
        aPerc = Math.min(0.30, 0.10 * aCount);
        label += ' (Concorrendo)';
      } else {
        const base = formData.ascendantsScenario === 'alone_under' ? 0.15 : 0.20;
        aPerc = Math.min(0.80, base * aCount);
        label += ' (Exclusividade)';
      }
      pensions.push({
        name: label,
        standardPercentage: aPerc,
        calculatedValue: 0
      });
    }

    // 2. Distribute R values
    let totalStandardPerc = pensions.reduce((acc, p) => acc + p.standardPercentage, 0);
    
    // Total caps
    const totalPensionBase = formData.agravatedResponsibility ? 1.0 : Math.min(0.80, totalStandardPerc);
    const finalTotalValue = R * totalPensionBase;

    pensions.forEach(p => {
        if (p.name.includes('Ex-Cônjuge')) return; // Already calculated with foods limit
        
        // Split proportional to standard percentages
        // Note: For aggravated fault, we split 100% R by weights of Arts 59-61
        const weight = p.standardPercentage / (totalStandardPerc || 1);
        p.calculatedValue = finalTotalValue * weight;
    });

    // Subsidies
    const deathSubsidy = 12 * unitIAS;
    const funeralCost = parseFloat(formData.funeralExpenses) || 0;
    const funeralLimit = (formData.isTranslation ? 8 : 4) * unitIAS;
    const funeralSubsidy = Math.min(funeralCost, funeralLimit);

    // One-offs
    const spousePension = pensions.find(p => p.name.includes('Cônjuge'))?.calculatedValue || 0;
    const remicaoSpouse = spousePension * 3;
    const reversaoFAT = pensions.length === 0 ? R * 3 : 0;

    setResults({
      iasValue: IAS,
      pensions,
      totalPensionValue: finalTotalValue,
      deathSubsidy,
      funeralSubsidy,
      remicaoSpouse,
      reversaoFAT
    });

  }, [formData]);

  const formatCurrency = (v: number) => v.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Cálculo por Morte</h1>
        <p className="text-slate-400 mt-2 text-lg">Acidentes de Trabalho - Pensões e Subsídios</p>
      </header>

      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
        <CalculationExplanation title="Morte do Sinistrado">
          <p>As pensões por morte baseiam-se nos Artigos 59.º a 61.º da NLAT. O montante total não pode exceder <strong>80% da retribuição</strong>, exceto em casos de responsabilidade agravada do empregador, onde a pensão é igual à totalidade da retribuição (100% R). Os subsídios por morte e funeral são indexados ao IAS de 2007-2025.</p>
        </CalculationExplanation>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Nome do Sinistrado" id="deceasedName" name="deceasedName" value={formData.deceasedName} onChange={handleInputChange} placeholder="Nome" />
            <InputGroup label="Retribuição Anual (€)" id="annualRemuneration" name="annualRemuneration" type="number" value={formData.annualRemuneration} onChange={handleInputChange} placeholder="Ex: 21000" />
            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-slate-300">Ano da Morte</label>
              <select name="yearOfDeath" value={formData.yearOfDeath} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 focus:ring-2 focus:ring-blue-500">
                {Object.keys(IAS_TABLE).reverse().map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-3 mt-8">
              <input type="checkbox" id="agravatedResponsibility" name="agravatedResponsibility" checked={formData.agravatedResponsibility} onChange={handleInputChange} className="h-5 w-5 text-blue-600 bg-slate-700 border-slate-600 rounded" />
              <label htmlFor="agravatedResponsibility" className="font-semibold text-slate-300">Responsabilidade Agravada (Culpa Empregador)</label>
            </div>
          </div>

          <div className="space-y-6 border-t border-slate-700 pt-6">
            <h3 className="text-xl font-bold text-slate-200">Beneficiários</h3>
            
            {/* Spouse */}
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <input type="checkbox" name="hasSpouse" checked={formData.hasSpouse} onChange={handleInputChange} className="h-4 w-4" id="chkSpouse" />
                <label htmlFor="chkSpouse" className="font-semibold text-slate-200">Cônjuge ou Unido de Facto</label>
              </div>
              {formData.hasSpouse && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-7 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <input type="radio" name="spouseScenario" value="under_retirement" checked={formData.spouseScenario === 'under_retirement'} onChange={handleInputChange} id="sp_under" />
                    <label htmlFor="sp_under" className="text-slate-400 text-sm">Até idade de reforma</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" name="spouseScenario" value="over_retirement" checked={formData.spouseScenario === 'over_retirement'} onChange={handleInputChange} id="sp_over" />
                    <label htmlFor="sp_over" className="text-slate-400 text-sm">Após reforma / Incap. &gt; 75%</label>
                  </div>
                </div>
              )}
            </div>

            {/* Ex-Spouse */}
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <input type="checkbox" name="hasExSpouse" checked={formData.hasExSpouse} onChange={handleInputChange} className="h-4 w-4" id="chkExSpouse" />
                <label htmlFor="chkExSpouse" className="font-semibold text-slate-200">Ex-Cônjuge (Com Alimentos)</label>
              </div>
              {formData.hasExSpouse && (
                <div className="ml-7 animate-fade-in">
                  <InputGroup label="Valor dos Alimentos Fixados (€)" id="exSpouseAlimentos" name="exSpouseAlimentos" type="number" value={formData.exSpouseAlimentos} onChange={handleInputChange} placeholder="Valor anual" />
                </div>
              )}
            </div>

            {/* Children */}
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="Nº de Filhos / Enteados" id="childrenCount" name="childrenCount" type="number" value={formData.childrenCount} onChange={handleInputChange} min="0" />
                <div className="flex items-center space-x-3 mt-8">
                  <input type="checkbox" id="isDoubleOrphan" name="isDoubleOrphan" checked={formData.isDoubleOrphan} onChange={handleInputChange} className="h-4 w-4" />
                  <label htmlFor="isDoubleOrphan" className="text-slate-300">Órfãos de Pai e Mãe</label>
                </div>
              </div>
            </div>

            {/* Ascendants */}
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
               <InputGroup label="Nº de Ascendentes / Outros" id="ascendantsCount" name="ascendantsCount" type="number" value={formData.ascendantsCount} onChange={handleInputChange} min="0" />
               {parseInt(formData.ascendantsCount) > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 ml-2 animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="ascendantsScenario" value="concurent" checked={formData.ascendantsScenario === 'concurent'} onChange={handleInputChange} id="asc_c" />
                      <label htmlFor="asc_c" className="text-slate-400 text-sm">Concorrendo</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="ascendantsScenario" value="alone_under" checked={formData.ascendantsScenario === 'alone_under'} onChange={handleInputChange} id="asc_u" />
                      <label htmlFor="asc_u" className="text-slate-400 text-sm">Sozinho (&lt; Reforma)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="ascendantsScenario" value="alone_over" checked={formData.ascendantsScenario === 'alone_over'} onChange={handleInputChange} id="asc_o" />
                      <label htmlFor="asc_o" className="text-slate-400 text-sm">Sozinho (&gt; Reforma)</label>
                    </div>
                 </div>
               )}
            </div>
          </div>

          <div className="space-y-6 border-t border-slate-700 pt-6">
            <h3 className="text-xl font-bold text-slate-200">Despesas e Subsídios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Despesas de Funeral (€)" id="funeralExpenses" name="funeralExpenses" type="number" value={formData.funeralExpenses} onChange={handleInputChange} placeholder="Valor total dos gastos" />
              <div className="flex items-center space-x-3 mt-8">
                <input type="checkbox" id="isTranslation" name="isTranslation" checked={formData.isTranslation} onChange={handleInputChange} className="h-5 w-5" />
                <label htmlFor="isTranslation" className="font-semibold text-slate-300">Inclui Trasladação</label>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-slate-700">
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-all">
              Calcular Prestações
            </button>
            <button type="button" onClick={handleReset} className="w-full sm:w-auto bg-slate-600 text-slate-200 font-semibold py-3 px-8 rounded-lg hover:bg-slate-500 transition-all">
              Limpar
            </button>
          </div>
        </form>
      </main>

      {results && (
        <section className="mt-10 bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">Resultados Detalhados</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultCard label="Subsídio por Morte" value={formatCurrency(results.deathSubsidy)} />
              <ResultCard label="Subsídio Funeral" value={formatCurrency(results.funeralSubsidy)} />
            </div>

            <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
              <h4 className="text-slate-400 text-sm uppercase tracking-wider mb-4 font-bold">Distribuição das Pensões Anuais</h4>
              <div className="space-y-3">
                {results.pensions.map((p, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-300">{p.name}</span>
                    <span className="text-blue-400 font-bold">{formatCurrency(p.calculatedValue)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 text-lg">
                  <span className="text-slate-100 font-bold">Total Pensão Anual (14 meses)</span>
                  <span className="text-green-400 font-extrabold">{formatCurrency(results.totalPensionValue)}</span>
                </div>
              </div>
            </div>

            {(results.remicaoSpouse > 0 || results.reversaoFAT > 0) && (
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 border-dashed">
                <h4 className="text-slate-400 text-sm uppercase tracking-wider mb-4 font-bold">Prestações Únicas Potenciais</h4>
                <div className="space-y-3">
                  {results.remicaoSpouse > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">Remição por novo casamento (Cônjuge)</span>
                      <span className="text-slate-100">{formatCurrency(results.remicaoSpouse)}</span>
                    </div>
                  )}
                  {results.reversaoFAT > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">Reversão para o FAT (Sem beneficiários)</span>
                      <span className="text-slate-100">{formatCurrency(results.reversaoFAT)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-xs text-slate-500 text-center">
              * Base de cálculo: {formData.agravatedResponsibility ? '100%' : '80%'} da Retribuição Anual Ilíquida (NLAT). IAS {formData.yearOfDeath}: {formatCurrency(results.iasValue)}.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

// --- MAIN APP (ROUTER) ---

type CalculatorInfo = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  component: React.FC<{ onBack: () => void; title?: string }>;
};

const calculators: CalculatorInfo[] = [
  { 
    id: 'partial-perm', 
    title: 'Incapacidade Permanente Parcial',
    shortTitle: 'IPP Parcial',
    description: 'Cálculo de pensão anual, capital de remição e retroativos.',
    component: PartialPermanentIncapacityCalculator 
  },
  { 
    id: 'abs-perm-total', 
    title: 'IPP Absoluta (Qualquer Trabalho)',
    shortTitle: 'Absoluta Total',
    description: 'Cálculo para incapacidade absoluta para todo e qualquer trabalho.',
    component: AbsolutePermanentTotalIncapacityCalculator 
  },
  { 
    id: 'abs-perm-habitual', 
    title: 'IPP Absoluta (Trabalho Habitual)',
    shortTitle: 'Absoluta Habitual',
    description: 'Cálculo para incapacidade absoluta para o trabalho habitual do sinistrado.',
    component: AbsoluteHabitualWorkIncapacityCalculator
  },
  { 
    id: 'temp-incapacity', 
    title: 'Incapacidade Temporária',
    shortTitle: 'Indemnização ITA/ITP',
    description: 'Indemnizações por múltiplos períodos de ITA ou ITP.',
    component: TemporaryIncapacityCalculator
  },
  { 
    id: 'high-incapacity-subsidy', 
    title: 'Subsídio de Elevada Incapacidade',
    shortTitle: 'Subsídio IAS',
    description: 'Subsídio por situações de elevada incapacidade permanente.',
    component: HighIncapacitySubsidyCalculator
  },
  { 
    id: 'pension-update', 
    title: 'Atualização de Pensões',
    shortTitle: 'Atualização Anual',
    description: 'Aplicação cronológica de coeficientes de atualização desde 1999.',
    component: PensionUpdateCalculator
  },
  { 
    id: 'fatal-accident', 
    title: 'Acidente Mortal',
    shortTitle: 'Pensões por Morte',
    description: 'Cálculo de pensões de sobrevivência, subsídios e despesas de funeral.',
    component: FatalAccidentCalculator
  },
];

const App: React.FC = () => {
  const [activeCalculatorId, setActiveCalculatorId] = useState<string>('');

  const activeCalculator = calculators.find(c => c.id === activeCalculatorId);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-10 font-sans max-w-7xl mx-auto w-full">
      {!activeCalculator ? (
        <div className="w-full animate-fade-in">
          <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">Portal do Juiz</h1>
            <p className="text-slate-400 mt-4 text-xl">Calculadoras de Acidentes de Trabalho</p>
          </header>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculators.map((calc) => (
              <button
                key={calc.id}
                onClick={() => setActiveCalculatorId(calc.id)}
                className="group flex flex-col p-6 bg-slate-800 border border-slate-700 rounded-2xl text-left transition-all duration-300 hover:bg-slate-750 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{calc.shortTitle}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white">{calc.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{calc.description}</p>
              </button>
            ))}
          </div>
          
          <footer className="mt-16 text-center text-slate-500 text-sm">
            <p>Portugal • Cálculo de Pensões Anuais e Capitais de Remição</p>
          </footer>
        </div>
      ) : (
        <activeCalculator.component 
          onBack={() => setActiveCalculatorId('')} 
          title={activeCalculator.title} 
        />
      )}
    </div>
  );
};

export default App;
