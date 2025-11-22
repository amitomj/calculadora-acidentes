import React, { useState, useCallback } from 'react';
import { RATE_TABLE, IAS_TABLE } from './constants';
import { numberToWordsPT } from './utils/numberToWordsPT';

// --- HELPER COMPONENTS (used by calculators) ---

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

const PlaceholderCalculator: React.FC<{ title: string; onBack: () => void; }> = ({ title, onBack }) => (
  <div className="w-full max-w-3xl mx-auto animate-fade-in">
    <BackButton onBack={onBack} />
    <main className="bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-700 text-center">
      <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
      <p className="mt-4 text-slate-400 text-lg">
        Esta calculadora está em desenvolvimento e estará disponível em breve.
      </p>
    </main>
  </div>
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
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Calculadora de Incapacidade Permanente Parcial</h1>
        <p className="text-slate-400 mt-2 text-lg">Acidentes de Trabalho</p>
      </header>
      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
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
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Calculadora de Incapacidade Permanente Absoluta para todo e qualquer trabalho</h1>
        <p className="text-slate-400 mt-2 text-lg">Acidentes de Trabalho</p>
      </header>
      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
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
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Calculadora de Incapacidade Permanente Absoluta para o trabalho habitual</h1>
        <p className="text-slate-400 mt-2 text-lg">Acidentes de Trabalho</p>
      </header>
      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
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
      setError('Os campos de nome, retribuição e todas as datas de período são obrigatórios.');
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
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Calculadora de Incapacidade Temporária</h1>
        <p className="text-slate-400 mt-2 text-lg">Acidentes de Trabalho</p>
      </header>
      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
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
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <BackButton onBack={onBack} />
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Calculadora do Subsídio por Situações de Elevada Incapacidade Permanente</h1>
        <p className="text-slate-400 mt-2 text-lg">Acidentes de Trabalho</p>
      </header>
      <main className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
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


// --- MAIN APP (ROUTER) ---

type CalculatorInfo = {
  id: string;
  title: string;
  description: string;
  component: React.FC<{ onBack: () => void; title?: string }>;
};

const calculators: CalculatorInfo[] = [
  { 
    id: 'partial-perm', 
    title: 'Incapacidade Permanente Parcial',
    description: 'Calcula a pensão anual, valor em dívida e capital de remição.',
    component: PartialPermanentIncapacityCalculator 
  },
  { 
    id: 'abs-perm-total', 
    title: 'Incapacidade Permanente Absoluta para todo e qualquer trabalho',
    description: 'Calcula a pensão para incapacidade absoluta para todo o trabalho.',
    component: AbsolutePermanentTotalIncapacityCalculator 
  },
  { 
    id: 'abs-perm-habitual', 
    title: 'Incapacidade Permanente Absoluta para o trabalho habitual',
    description: 'Calcula a pensão para incapacidade absoluta para o trabalho habitual.',
    component: AbsoluteHabitualWorkIncapacityCalculator
  },
  { 
    id: 'temp-incapacity', 
    title: 'Incapacidade Temporária (Absoluta e Parcial)',
    description: 'Calcula a indemnização para múltiplos períodos de incapacidade.',
    component: TemporaryIncapacityCalculator
  },
  { 
    id: 'high-incapacity-subsidy', 
    title: 'Subsídio por situações de elevada incapacidade permanente',
    description: 'Calcula o subsídio para incapacidades permanentes elevadas.',
    component: HighIncapacitySubsidyCalculator
  },
];

const App: React.FC = () => {
  const [activeCalculatorId, setActiveCalculatorId] = useState<string>('');

  const handleCalculatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveCalculatorId(e.target.value);
  };

  const activeCalculator = calculators.find(c => c.id === activeCalculatorId);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      {!activeCalculator ? (
        <div className="w-full max-w-xl mx-auto text-center animate-fade-in">
          <header className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-100">Calculadoras</h1>
            <p className="text-slate-400 mt-3 text-xl">Acidentes de Trabalho</p>
          </header>
          <div className="w-full">
            <label htmlFor="calculator-select" className="sr-only">Selecione uma calculadora</label>
            <select
              id="calculator-select"
              value={activeCalculatorId}
              onChange={handleCalculatorChange}
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-lg text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Selecione uma calculadora"
            >
              <option value="" disabled>Selecione uma calculadora...</option>
              {calculators.map((calc) => (
                <option key={calc.id} value={calc.id}>
                  {calc.title}
                </option>
              ))}
            </select>
          </div>
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