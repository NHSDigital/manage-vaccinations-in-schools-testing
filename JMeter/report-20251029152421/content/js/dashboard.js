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

    var data = {"OkPercent": 99.97534820658203, "KoPercent": 0.024651793417971156};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3567927857282886, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.06315007429420505, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.2199108469539376, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8655274888558693, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8320950965824666, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.4226110363391655, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3186046511627907, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4933135215453195, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4952893674293405, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.37012113055181695, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7303120356612184, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5787518573551264, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8113, 2, 0.024651793417971156, 1103.286084062615, 278, 8337, 874.0, 1949.0, 2377.2999999999993, 3256.0, 4.918594323579606, 2010.566792800501, 20.71740469295161], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 673, 0, 0.0, 1918.053491827639, 1263, 4376, 1827.0, 2442.0, 2769.0999999999995, 3283.3199999999993, 0.45423835432076515, 183.2674599660266, 2.38725406355186], "isController": false}, {"data": ["4.1 Vaccination questions", 673, 0, 0.0, 1549.2689450222902, 569, 2506, 1509.0, 1728.2000000000003, 1840.8999999999994, 2138.8399999999992, 0.45093607763336957, 178.03035022171582, 2.266409992271103], "isController": false}, {"data": ["2.0 Register attendance", 673, 2, 0.2971768202080238, 3169.420505200594, 1555, 5860, 3287.0, 4086.4, 4375.599999999997, 5227.84, 0.4506133161926188, 853.783048498681, 7.855362248245755], "isController": true}, {"data": ["1.0 Login", 743, 0, 0.0, 5197.267833109018, 3328, 10446, 5002.0, 6094.0, 6982.799999999996, 8830.359999999995, 0.45334428356044276, 754.451168003145, 7.608809325445977], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 167, 0, 0.0, 4386.874251497003, 3689, 5967, 4308.0, 4970.200000000001, 5297.999999999999, 5918.719999999999, 0.11372287845543902, 136.09005150599396, 1.685919328599193], "isController": true}, {"data": ["2.5 Select patient", 673, 0, 0.0, 469.16196136701325, 340, 1945, 415.0, 644.6, 761.4999999999998, 1079.9599999999996, 0.4521293748387652, 183.93208796246688, 1.6291430794226047], "isController": false}, {"data": ["2.3 Search by first/last name", 673, 0, 0.0, 485.4413075780089, 341, 1784, 415.0, 699.2, 790.1999999999998, 1007.0599999999993, 0.45143637933266567, 184.16256735805578, 1.7006868851023982], "isController": false}, {"data": ["4.0 Vaccination for flu", 178, 0, 0.0, 4374.943820224717, 3469, 6682, 4297.5, 5125.5, 5266.349999999999, 6219.060000000005, 0.1193341423026126, 142.61971439417812, 1.7654371786190761], "isController": true}, {"data": ["4.0 Vaccination for hpv", 159, 0, 0.0, 4424.415094339626, 3560, 6591, 4334.0, 4975.0, 5438.0, 6420.600000000001, 0.11432655547030997, 136.40171246821868, 1.6938637513275183], "isController": true}, {"data": ["1.2 Sign-in page", 743, 0, 0.0, 912.0161507402422, 278, 2721, 689.0, 1625.4, 1694.7999999999997, 1993.9199999999996, 0.4544031234557633, 182.3786723258483, 1.9493014373786015], "isController": false}, {"data": ["2.4 Patient attending session", 430, 2, 0.46511627906976744, 1451.6279069767443, 783, 3219, 1364.5, 1835.5000000000002, 2026.1, 2975.4199999999996, 0.28831390008247115, 117.92402048704933, 1.2787001715635329], "isController": false}, {"data": ["1.4 Open Sessions list", 743, 0, 0.0, 2429.6150740242265, 1511, 8337, 2132.0, 3256.0, 4055.9999999999986, 5847.359999999994, 0.45400135283848614, 208.7288954102785, 1.6342305095248628], "isController": false}, {"data": ["4.2 Vaccination batch", 673, 0, 0.0, 925.50074294205, 529, 2156, 939.0, 1099.0, 1221.4999999999998, 1582.4599999999994, 0.45137370523486187, 179.39130761994102, 2.0459427265537182], "isController": false}, {"data": ["1.1 Homepage", 743, 0, 0.0, 789.3728129205927, 509, 1858, 712.0, 1220.0, 1248.0, 1519.479999999994, 0.45423755340195193, 182.11663554577743, 1.9344272957795645], "isController": false}, {"data": ["1.3 Sign-in", 743, 0, 0.0, 1066.2637954239576, 485, 2460, 949.0, 1618.0, 1694.5999999999995, 2079.5599999999986, 0.4543581075709637, 182.71987539913036, 2.106261368507663], "isController": false}, {"data": ["2.2 Session register", 673, 0, 0.0, 555.8083209509657, 338, 1803, 512.0, 783.6, 914.5999999999999, 1274.6599999999996, 0.451027646051196, 189.11608335558873, 1.6320719987226469], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 169, 0, 0.0, 4387.810650887575, 3644, 5728, 4332.0, 4943.0, 5202.0, 5581.000000000003, 0.11613388243815184, 139.1023533775375, 1.7214893895549597], "isController": true}, {"data": ["2.1 Open session", 673, 0, 0.0, 731.5200594353635, 354, 2315, 701.0, 1028.0, 1210.3999999999996, 1560.8399999999992, 0.4511222755867773, 180.14279603642493, 1.6284494797933418], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, 100.0, 0.024651793417971156], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8113, 2, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 430, 2, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
