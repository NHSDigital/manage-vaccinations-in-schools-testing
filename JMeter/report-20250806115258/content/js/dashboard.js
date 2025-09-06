/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.09198800342759211, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.09284116331096197, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.05351170568561873, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.06312625250501001, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.047619047619047616, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.05223880597014925, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.004484304932735426, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.05714285714285714, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7428571428571429, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.003006012024048096, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [7.147962830593281E-4, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.014492753623188406, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.0412262156448203, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.04225352112676056, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.013888888888888888, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.0625, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [1.0, 500, 1500, "Select Teams"], "isController": true}, {"data": [0.08465011286681716, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.0, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.043478260869565216, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.16666666666666666, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.04830747531734838, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.028985507246376812, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.03707414829659319, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.32142857142857145, 500, 1500, "1.4 Select Team"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9612, 0, 0.0, 4363.131294215559, 0, 31604, 3828.0, 8280.100000000002, 10214.450000000003, 14871.06000000011, 2.6683382182540765, 63.442848687185645, 3.629499882035271], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 12, 0, 0.0, 42846.083333333336, 18202, 89310, 39093.5, 77343.00000000004, 89310.0, 89310.0, 0.004743180492247271, 1.1129895413117188, 0.07591095992882067], "isController": true}, {"data": ["2.0 Register attendance", 498, 0, 0.0, 22690.516064257055, 6411, 54222, 22456.5, 33863.8, 37946.049999999996, 45548.56999999998, 0.14169444361457403, 26.892111464606263, 0.5826637724047226], "isController": true}, {"data": ["2.5 Select patient", 447, 0, 0.0, 3392.263982102905, 765, 18848, 3061.0, 5776.8, 7217.199999999998, 13422.999999999976, 0.12790318043991253, 3.636502290811773, 0.08868286925032999], "isController": false}, {"data": ["2.5 Select menacwy", 299, 0, 0.0, 3726.0167224080287, 793, 14504, 3563.0, 5929.0, 7273.0, 12922.0, 0.09217609889169802, 2.327665364672847, 0.06427122520378162], "isController": false}, {"data": ["2.3 Search by first/last name", 499, 0, 0.0, 3975.5931863727465, 890, 18562, 3731.0, 6598.0, 8201.0, 13169.0, 0.1426592659194447, 6.2095638305513825, 0.11136237320764643], "isController": false}, {"data": ["2.5 Select td_ipv", 294, 0, 0.0, 3757.061224489795, 799, 11649, 3467.5, 6247.5, 7682.75, 9735.600000000017, 0.0930813930295334, 2.384012921494077, 0.06481155588872785], "isController": false}, {"data": ["4.0 Vaccination for flu", 429, 0, 0.0, 14728.834498834489, 3661, 36379, 14610.0, 22931.0, 25899.5, 32256.199999999975, 0.12488414012175184, 6.808019258393436, 0.7458147051766368], "isController": true}, {"data": ["4.0 Vaccination for hpv", 408, 0, 0.0, 15584.095588235292, 3486, 40281, 14977.0, 24425.800000000003, 27479.899999999998, 32884.419999999984, 0.12257670658020602, 6.55731396130662, 0.7421557315463473], "isController": true}, {"data": ["5.8 Consent confirm", 67, 0, 0.0, 8580.537313432833, 2303, 19111, 7721.0, 14245.6, 16458.599999999984, 19111.0, 0.021446794344448322, 2.1912454365543, 0.04734624929177563], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 103.6857142857143, 90, 258, 97.0, 122.6, 135.05, 258.0, 0.07897423747553209, 0.47399967141076194, 0.047585063010159474], "isController": false}, {"data": ["5.9 Patient home page", 67, 0, 0.0, 3724.3880597014922, 912, 13369, 3289.0, 6114.2000000000035, 7971.9999999999945, 13369.0, 0.02141120963108166, 0.5614191558462828, 0.01597913881078946], "isController": false}, {"data": ["2.4 Patient attending session", 446, 0, 0.0, 5875.340807174887, 1441, 17872, 5430.5, 9719.2, 12193.499999999998, 16970.199999999997, 0.1273392883960789, 5.755711912544033, 0.18926796576057814], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 116.0, 116, 116, 116.0, 116.0, 116.0, 116.0, 8.620689655172413, 41.31027747844827, 6.297144396551724], "isController": false}, {"data": ["5.4 Consent route", 70, 0, 0.0, 3991.2857142857138, 902, 16584, 3605.0, 6429.8, 8220.55, 16584.0, 0.021686208005432705, 0.2673729737143022, 0.03450612120328713], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 313.58571428571435, 263, 675, 295.0, 353.5, 448.15000000000003, 675.0, 0.07887119545070945, 0.44141681750782796, 0.04274757175307006], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 571.9714285714286, 434, 1389, 504.5, 759.8, 965.5500000000006, 1389.0, 0.07783918424534911, 0.8273453919202927, 0.12185176986845178], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 285, 0, 0.0, 15997.529824561407, 4217, 46761, 15261.0, 24715.200000000004, 27397.399999999998, 33810.67999999995, 0.09177951790312464, 5.3323805555993875, 0.5535414435243593], "isController": true}, {"data": ["2.1 Open session", 499, 0, 0.0, 5975.795591182363, 1424, 20854, 5747.0, 9242.0, 10256.0, 14526.0, 0.14269361507553754, 2.547224678889323, 0.09302468919457604], "isController": false}, {"data": ["4.3 Vaccination confirm", 1399, 0, 0.0, 7320.371694067191, 1489, 31604, 6803.0, 11923.0, 13608.0, 19437.0, 0.41093794014640433, 8.84845989009613, 0.9564027964341514], "isController": false}, {"data": ["5.6 Consent questions", 69, 0, 0.0, 4066.8695652173915, 1167, 13635, 3773.0, 6012.0, 9223.5, 13635.0, 0.021594155682595956, 0.2726647240924117, 0.053966440530477645], "isController": false}, {"data": ["4.1 Vaccination questions", 1419, 0, 0.0, 4138.0584918957, 847, 22094, 3710.0, 6965.0, 8881.0, 12191.399999999998, 0.41255924542652345, 4.963446126965617, 0.8708707687601068], "isController": false}, {"data": ["5.3 Consent parent details", 71, 0, 0.0, 4493.2394366197195, 883, 13316, 4015.0, 7815.4, 11175.599999999991, 13316.0, 0.02192693266609574, 0.2569146225077802, 0.04048176704131868], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 72, 0, 0.0, 4578.7361111111095, 883, 15161, 3954.5, 8251.300000000001, 10884.849999999997, 15161.0, 0.02213355138980258, 0.47025661134175434, 0.03523361896245904], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 4321.699999999999, 2665, 11659, 3709.5, 6620.0, 8583.500000000004, 11659.0, 0.07833947179051577, 4.750325021375485, 0.37280102151873373], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 296, 0, 0.0, 15893.912162162163, 3673, 42123, 15261.5, 24292.4, 27314.1, 36469.839999999866, 0.09186053584485003, 5.037356795708996, 0.5564899041857371], "isController": true}, {"data": ["5.0 Consent for td_ipv", 11, 0, 0.0, 47257.18181818182, 30217, 67596, 44585.0, 66596.0, 67596.0, 67596.0, 0.004427826231167147, 1.0405482055177557, 0.07100442332293062], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 424, 0, 0.0, 3690.9834905660377, 782, 16654, 3455.0, 6016.0, 8040.25, 12402.75, 0.12524236169285138, 2.9867665009580744, 0.09332023630043515], "isController": false}, {"data": ["Select Teams", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select flu", 443, 0, 0.0, 3475.7674943566603, 775, 12131, 3161.0, 5648.200000000001, 6920.799999999999, 10995.52, 0.12709823258861802, 2.9830400561340964, 0.08812475111124883], "isController": false}, {"data": ["5.1 Consent start", 72, 0, 0.0, 5320.805555555555, 1587, 29138, 4723.5, 7912.0, 11570.099999999999, 29138.0, 0.02214791051382845, 0.29044740048128637, 0.04789131176306288], "isController": false}, {"data": ["5.5 Consent agree", 69, 0, 0.0, 4747.623188405797, 1118, 14751, 3868.0, 7707.0, 11286.5, 14751.0, 0.021616730973830597, 0.37320189525472025, 0.033989384638242436], "isController": false}, {"data": ["Debug Sampler", 499, 0, 0.0, 0.29458917835671333, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.1428440566567048, 0.690980616218955, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 120, 0, 0.0, 2687.0166666666673, 990, 7112, 2135.0, 5480.000000000001, 6109.399999999998, 7103.389999999999, 0.03379245071019059, 0.7993696616727995, 0.020925029089667986], "isController": false}, {"data": ["4.2 Vaccination batch", 1418, 0, 0.0, 4113.142454160788, 845, 23677, 3603.0, 7065.1, 8945.55, 14157.73999999998, 0.41241167177382393, 8.963613313378774, 0.6675193084389957], "isController": false}, {"data": ["5.0 Consent for hpv", 21, 0, 0.0, 44120.52380952382, 16213, 66903, 45155.0, 63187.600000000006, 66615.59999999999, 66903.0, 0.007253174472694216, 1.6797149962231683, 0.11596107130595824], "isController": true}, {"data": ["5.7 Consent triage", 69, 0, 0.0, 4564.115942028986, 925, 23748, 3583.0, 7391.0, 9562.5, 23748.0, 0.021568073999124148, 0.3627329039411123, 0.03634667361690037], "isController": false}, {"data": ["5.0 Consent for flu", 23, 0, 0.0, 42218.565217391304, 11131, 71715, 40302.0, 60783.80000000001, 69950.99999999997, 71715.0, 0.007644586552507508, 1.7894428207776538, 0.11998547320821694], "isController": true}, {"data": ["2.2 Session register", 499, 0, 0.0, 4032.895791583165, 871, 17899, 3700.0, 6728.0, 7900.0, 13011.0, 0.14260655052758706, 7.886517113286187, 0.09422130804072318], "isController": false}, {"data": ["1.4 Select Team", 70, 0, 0.0, 1484.2142857142862, 810, 5020, 1089.5, 2766.7, 3036.55, 5020.0, 0.07774831980327454, 1.1471673475660888, 0.11282617502701754], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9612, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
